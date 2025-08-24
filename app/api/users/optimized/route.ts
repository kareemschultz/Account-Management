/**
 * ESM Platform - Optimized Users API Endpoint
 * High-performance version with caching, rate limiting, and response optimization
 */

import { type NextRequest } from "next/server";
import { optimizedAPIResponse, metricsCollector } from "@/lib/api-optimization";
import { getCachedQuery, clearQueryCache, queryBatch } from "@/lib/database";
import { withApiAuth, sanitizeInput } from "@/lib/api-auth";
import { z } from "zod";

// Input validation schemas
const getUsersQuerySchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).default("1"),
  limit: z.string().regex(/^\d+$/).transform(Number).default("25"),
  search: z.string().max(100).optional(),
  department: z.string().max(50).optional(),
  employmentType: z.enum(["Permanent", "Contract", "Temporary", "Consultant", "Intern"]).optional(),
  securityClearance: z.enum(["Public", "Internal", "Confidential", "Restricted", "Top Secret"]).optional(),
  status: z.enum(["active", "dormant", "suspended"]).optional(),
  sortBy: z.enum(["name", "department", "employmentType", "securityClearance", "hireDate"]).default("name"),
  sortOrder: z.enum(["asc", "desc"]).default("asc")
});

const createUserSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
  email: z.string().email("Invalid email format"),
  employeeId: z.string().min(1, "Employee ID is required").max(20, "Employee ID too long"),
  departmentId: z.number().int().positive("Department ID is required"),
  jobTitle: z.string().max(100, "Job title too long").optional(),
  employmentType: z.enum(["Permanent", "Contract", "Temporary", "Consultant", "Intern"]).default("Permanent"),
  securityClearance: z.enum(["Public", "Internal", "Confidential", "Restricted", "Top Secret"]).default("Public"),
  phoneNumber: z.string().max(20, "Phone number too long").optional(),
  hireDate: z.string().datetime().optional()
});

// Optimized user data fetch with caching
async function getUsers(queryParams: z.infer<typeof getUsersQuerySchema>, userId?: string) {
  const { page, limit, search, department, employmentType, securityClearance, status, sortBy, sortOrder } = queryParams;
  
  // Create cache key for this specific query
  const cacheKey = `users:${JSON.stringify(queryParams)}:${userId}`;
  
  return getCachedQuery(
    cacheKey,
    async () => {
      let baseQuery = `
        SELECT 
          u.id,
          u.employee_id,
          u.first_name || ' ' || u.last_name as name,
          u.first_name,
          u.last_name,
          u.email,
          u.phone_number,
          u.job_title,
          u.employment_type,
          u.security_clearance,
          u.status,
          u.hire_date,
          u.last_login,
          u.created_at,
          u.updated_at,
          d.name as department,
          d.id as department_id,
          COUNT(DISTINCT usa.id) FILTER (WHERE usa.is_active = true) as active_services,
          COUNT(DISTINCT va.id) FILTER (WHERE va.is_active = true) as vpn_accounts,
          MAX(al.timestamp) as last_activity
        FROM users u
        LEFT JOIN departments d ON u.department_id = d.id
        LEFT JOIN user_service_access usa ON u.id = usa.user_id
        LEFT JOIN vpn_access va ON u.id = va.user_id
        LEFT JOIN audit_logs al ON u.id = al.user_id
        WHERE 1=1
      `;
      
      const params: any[] = [];
      let paramIndex = 1;
      
      // Apply filters
      if (search) {
        baseQuery += ` AND (
          u.first_name ILIKE $${paramIndex} OR 
          u.last_name ILIKE $${paramIndex} OR 
          u.email ILIKE $${paramIndex} OR 
          u.employee_id ILIKE $${paramIndex}
        )`;
        params.push(`%${sanitizeInput(search)}%`);
        paramIndex++;
      }
      
      if (department) {
        baseQuery += ` AND d.name = $${paramIndex}`;
        params.push(sanitizeInput(department));
        paramIndex++;
      }
      
      if (employmentType) {
        baseQuery += ` AND u.employment_type = $${paramIndex}`;
        params.push(employmentType);
        paramIndex++;
      }
      
      if (securityClearance) {
        baseQuery += ` AND u.security_clearance = $${paramIndex}`;
        params.push(securityClearance);
        paramIndex++;
      }
      
      if (status) {
        baseQuery += ` AND u.status = $${paramIndex}`;
        params.push(status);
        paramIndex++;
      }
      
      baseQuery += ` GROUP BY u.id, d.name, d.id`;
      
      // Add sorting
      const sortColumn = {
        name: 'u.first_name',
        department: 'd.name',
        employmentType: 'u.employment_type',
        securityClearance: 'u.security_clearance',
        hireDate: 'u.hire_date'
      }[sortBy];
      
      baseQuery += ` ORDER BY ${sortColumn} ${sortOrder.toUpperCase()}`;
      
      // Execute count and data queries in parallel
      const countQuery = baseQuery.replace(
        /SELECT[\s\S]*?FROM/i, 
        'SELECT COUNT(DISTINCT u.id) as total FROM'
      ).replace(/ORDER BY[\s\S]*$/, '');
      
      // Add pagination to data query
      const dataQuery = baseQuery + ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
      params.push(limit, (page - 1) * limit);
      
      // Execute queries in parallel
      const [countResult, dataResult] = await queryBatch([
        { text: countQuery, params: params.slice(0, -2) },
        { text: dataQuery, params }
      ]);
      
      const total = parseInt(countResult[0]?.total || '0');
      const users = dataResult.map((row: any) => ({
        ...row,
        activeServices: parseInt(row.active_services || '0'),
        vpnAccounts: parseInt(row.vpn_accounts || '0')
      }));
      
      return {
        users,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasNextPage: page < Math.ceil(total / limit),
          hasPreviousPage: page > 1
        }
      };
    },
    300000 // Cache for 5 minutes
  );
}

// Optimized user creation
async function createUser(userData: z.infer<typeof createUserSchema>, createdBy: string) {
  const bcrypt = require('bcryptjs');
  const hashedPassword = await bcrypt.hash('TempPass123!', 12); // Temporary password
  
  // Check for existing user first
  const existingUser = await getCachedQuery(
    `user_exists:${userData.email}:${userData.employeeId}`,
    async () => {
      const result = await queryBatch([
        { text: 'SELECT id FROM users WHERE email = $1', params: [userData.email] },
        { text: 'SELECT id FROM users WHERE employee_id = $1', params: [userData.employeeId] }
      ]);
      
      return {
        emailExists: result[0].length > 0,
        employeeIdExists: result[1].length > 0
      };
    },
    60000 // Cache for 1 minute (short-lived for data consistency)
  );
  
  if (existingUser.emailExists || existingUser.employeeIdExists) {
    throw new Error('User with this email or employee ID already exists');
  }
  
  // Create user with transaction
  const queries = [
    {
      text: `
        INSERT INTO users (
          employee_id, first_name, last_name, email, phone_number, job_title,
          employment_type, security_clearance, status, department_id, hire_date,
          password_hash, created_by, updated_by
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'active', $9, $10, $11, $12, $12)
        RETURNING *
      `,
      params: [
        userData.employeeId,
        userData.name.split(' ')[0] || '',
        userData.name.split(' ').slice(1).join(' ') || '',
        userData.email.toLowerCase(),
        userData.phoneNumber || null,
        userData.jobTitle || null,
        userData.employmentType,
        userData.securityClearance,
        userData.departmentId,
        userData.hireDate || new Date().toISOString(),
        hashedPassword,
        createdBy
      ]
    }
  ];
  
  const results = await queryBatch(queries, { transaction: true });
  const newUser = results[0][0];
  
  // Clear relevant caches
  clearQueryCache('users:');
  clearQueryCache('user_exists:');
  
  return {
    ...newUser,
    name: `${newUser.first_name} ${newUser.last_name}`.trim(),
    password: undefined // Never return password
  };
}

// GET endpoint with optimization
export async function GET(request: NextRequest) {
  return optimizedAPIResponse(
    request,
    async () => {
      metricsCollector.recordRequest();
      
      const { searchParams } = new URL(request.url);
      
      // Validate query parameters
      const queryResult = getUsersQuerySchema.safeParse({
        page: searchParams.get("page") || "1",
        limit: searchParams.get("limit") || "25",
        search: searchParams.get("search") || undefined,
        department: searchParams.get("department") || undefined,
        employmentType: searchParams.get("employmentType") || undefined,
        securityClearance: searchParams.get("securityClearance") || undefined,
        status: searchParams.get("status") || undefined,
        sortBy: searchParams.get("sortBy") || "name",
        sortOrder: searchParams.get("sortOrder") || "asc"
      });
      
      if (!queryResult.success) {
        throw new Error(`Invalid query parameters: ${queryResult.error.errors.map(e => e.message).join(', ')}`);
      }
      
      // Get user data with caching
      const result = await getUsers(queryResult.data);
      
      return result;
    },
    {
      cache: true,
      cacheTTL: 300000, // 5 minutes
      rateLimitType: 'search',
      includeMetrics: true
    }
  );
}

// POST endpoint with optimization
export async function POST(request: NextRequest) {
  return optimizedAPIResponse(
    request,
    async () => {
      metricsCollector.recordRequest();
      
      const body = await request.json();
      
      // Validate input data
      const validationResult = createUserSchema.safeParse(body);
      if (!validationResult.success) {
        throw new Error(`Invalid input data: ${validationResult.error.errors.map(e => e.message).join(', ')}`);
      }
      
      // Create user
      const newUser = await createUser(validationResult.data, 'system'); // TODO: Get actual user ID from auth
      
      return {
        message: "User created successfully",
        user: newUser
      };
    },
    {
      cache: false, // Don't cache POST responses
      rateLimitType: 'general',
      includeMetrics: true
    }
  );
}

// Bulk operations endpoint
export async function PATCH(request: NextRequest) {
  return optimizedAPIResponse(
    request,
    async () => {
      metricsCollector.recordRequest();
      
      const body = await request.json();
      const { operation, userIds, data } = body;
      
      if (!operation || !userIds || !Array.isArray(userIds)) {
        throw new Error('Invalid bulk operation request');
      }
      
      // Process bulk operation based on type
      let result;
      
      switch (operation) {
        case 'updateStatus':
          if (!data?.status) {
            throw new Error('Status is required for bulk status update');
          }
          
          const updateQuery = `
            UPDATE users 
            SET status = $1, updated_at = NOW()
            WHERE id = ANY($2)
            RETURNING id, status
          `;
          
          result = await queryBatch([{
            text: updateQuery,
            params: [data.status, userIds]
          }], { transaction: true });
          
          break;
          
        case 'updateDepartment':
          if (!data?.departmentId) {
            throw new Error('Department ID is required for bulk department update');
          }
          
          const deptUpdateQuery = `
            UPDATE users 
            SET department_id = $1, updated_at = NOW()
            WHERE id = ANY($2)
            RETURNING id, department_id
          `;
          
          result = await queryBatch([{
            text: deptUpdateQuery,
            params: [data.departmentId, userIds]
          }], { transaction: true });
          
          break;
          
        default:
          throw new Error(`Unsupported bulk operation: ${operation}`);
      }
      
      // Clear relevant caches
      clearQueryCache('users:');
      
      return {
        message: `Bulk ${operation} completed successfully`,
        updatedUsers: result[0].length,
        details: result[0]
      };
    },
    {
      cache: false,
      rateLimitType: 'bulk',
      includeMetrics: true
    }
  );
}
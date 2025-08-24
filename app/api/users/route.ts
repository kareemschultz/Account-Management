import { type NextRequest, NextResponse } from "next/server"
import { withApiAuth, sanitizeInput, validateEmail, addSecurityHeaders } from "@/lib/api-auth"
import { z } from "zod"
import { pool } from "@/lib/auth"

// Input validation schema
const createUserSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
  email: z.string().email("Invalid email format"),
  username: z.string().min(3, "Username must be at least 3 characters").max(30, "Username too long"),
  department_id: z.number().int().positive("Department ID is required"),
  position: z.string().max(100, "Position too long").optional(),
  employment_type: z.enum(["Permanent", "Contract", "Temporary", "Consultant", "Intern"]).default("Permanent"),
  security_clearance: z.enum(["Public", "Internal", "Confidential", "Restricted", "Top Secret"]).default("Public"),
  password: z.string().min(8, "Password must be at least 8 characters")
})

const getUsersQuerySchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).default("1"),
  limit: z.string().regex(/^\d+$/).transform(Number).default("20"),
  search: z.string().max(100).optional(),
  department: z.string().max(50).optional(),
  status: z.enum(["Active", "Inactive", "Suspended"]).optional()
})

export const GET = withApiAuth(
  async (request: NextRequest, { user }) => {
    const { searchParams } = new URL(request.url)
    
    // Validate query parameters
    const queryResult = getUsersQuerySchema.safeParse({
      page: searchParams.get("page") || "1",
      limit: searchParams.get("limit") || "20",
      search: searchParams.get("search") || undefined,
      department: searchParams.get("department") || undefined,
      status: searchParams.get("status") || undefined,
    })

    if (!queryResult.success) {
      return NextResponse.json({
        error: "Invalid query parameters",
        details: queryResult.error.errors
      }, { status: 400 })
    }

    const { page, limit, search, department, status } = queryResult.data

    try {
      const client = await pool.connect()
      try {
        let query = `
          SELECT 
            u.id,
            u.name,
            u.username,
            u.email,
            u.employee_id,
            u.position,
            u.employment_status,
            u.employment_type,
            u.security_clearance,
            u.hire_date,
            u.last_login,
            u.active,
            u.created_at,
            d.name as department_name,
            COUNT(usa.id) FILTER (WHERE usa.has_access = true) as service_count,
            ARRAY_AGG(
              CASE WHEN ur.active = true 
              THEN jsonb_build_object('name', r.name, 'display_name', r.display_name)
              ELSE NULL END
            ) FILTER (WHERE ur.active = true) as roles
          FROM users u
          LEFT JOIN departments d ON u.department_id = d.id
          LEFT JOIN user_service_access usa ON u.id = usa.user_id
          LEFT JOIN user_roles ur ON u.id = ur.user_id AND (ur.expires_at IS NULL OR ur.expires_at > NOW())
          LEFT JOIN roles r ON ur.role_id = r.id
          WHERE 1=1
        `
        const params: any[] = []

        // Apply filters based on user permissions
        if (!user.permissions.users?.includes('*') && !user.permissions.users?.includes('read')) {
          // Users can only see their own record
          query += ` AND u.id = $${params.length + 1}`
          params.push(parseInt(user.id))
        }

        if (search) {
          query += ` AND (u.name ILIKE $${params.length + 1} OR u.email ILIKE $${params.length + 2} OR u.username ILIKE $${params.length + 3})`
          const searchTerm = `%${sanitizeInput(search)}%`
          params.push(searchTerm, searchTerm, searchTerm)
        }

        if (department) {
          query += ` AND d.name = $${params.length + 1}`
          params.push(sanitizeInput(department))
        }

        if (status) {
          query += ` AND u.employment_status = $${params.length + 1}`
          params.push(status)
        }

        query += ` GROUP BY u.id, d.name ORDER BY u.name`

        // Get total count
        const countQuery = query.replace(/SELECT[\s\S]*?FROM/, 'SELECT COUNT(DISTINCT u.id) as total FROM')
        const countResult = await client.query(countQuery, params)
        const total = parseInt(countResult.rows[0].total)

        // Add pagination
        query += ` LIMIT $${params.length + 1} OFFSET $${params.length + 2}`
        params.push(limit, (page - 1) * limit)

        const result = await client.query(query, params)

        const response = NextResponse.json({
          users: result.rows.map(row => ({
            ...row,
            roles: row.roles || []
          })),
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        })

        return addSecurityHeaders(response)
      } finally {
        client.release()
      }
    } catch (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: "Database error" }, { status: 500 })
    }
  },
  {
    allowedRoles: ['admin', 'super_admin', 'manager', 'user'],
    rateLimit: { windowMs: 60000, maxRequests: 100 }, // 100 requests per minute
  }
)

export const POST = withApiAuth(
  async (request: NextRequest, { user, validatedData }) => {
    const userData = validatedData as z.infer<typeof createUserSchema>

    try {
      const bcrypt = require('bcryptjs')
      const hashedPassword = await bcrypt.hash(userData.password, 12)

      const client = await pool.connect()
      try {
        // Check if user already exists
        const existingUser = await client.query(
          'SELECT id FROM users WHERE username = $1 OR email = $2',
          [userData.username, userData.email]
        )

        if (existingUser.rows.length > 0) {
          return NextResponse.json({
            error: "User with this username or email already exists"
          }, { status: 409 })
        }

        // Create user
        const result = await client.query(`
          INSERT INTO users (
            name, username, email, password_hash, department_id, position, 
            employment_type, security_clearance, active
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, true)
          RETURNING id, name, username, email, employee_id, position, 
                    employment_type, security_clearance, created_at
        `, [
          sanitizeInput(userData.name),
          sanitizeInput(userData.username),
          userData.email.toLowerCase(),
          hashedPassword,
          userData.department_id,
          userData.position ? sanitizeInput(userData.position) : null,
          userData.employment_type,
          userData.security_clearance
        ])

        const newUser = result.rows[0]

        // Assign default user role
        await client.query(`
          INSERT INTO user_roles (user_id, role_id, granted_by)
          SELECT $1, id, $2 FROM roles WHERE name = 'user'
        `, [newUser.id, parseInt(user.id)])

        const response = NextResponse.json({
          message: "User created successfully",
          user: {
            ...newUser,
            password: undefined // Never return password
          }
        }, { status: 201 })

        return addSecurityHeaders(response)
      } finally {
        client.release()
      }
    } catch (error) {
      console.error('User creation error:', error)
      return NextResponse.json({ error: "Failed to create user" }, { status: 500 })
    }
  },
  {
    requiredPermissions: [{ resource: 'users', action: 'create' }],
    validateInput: createUserSchema,
    rateLimit: { windowMs: 300000, maxRequests: 10 }, // 10 requests per 5 minutes
  }
)

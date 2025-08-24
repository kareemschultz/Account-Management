import { z } from 'zod'
import DOMPurify from 'isomorphic-dompurify'

// Custom Zod schemas for common validation patterns
export const secureStringSchema = z.string()
  .min(1, 'Field is required')
  .max(1000, 'Input too long')
  .transform(sanitizeString)

export const emailSchema = z.string()
  .email('Invalid email format')
  .toLowerCase()
  .transform(sanitizeString)

export const usernameSchema = z.string()
  .min(3, 'Username must be at least 3 characters')
  .max(30, 'Username too long')
  .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and hyphens')
  .transform(sanitizeString)

export const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .max(128, 'Password too long')
  .refine(
    (password) => {
      // At least one uppercase letter
      if (!/[A-Z]/.test(password)) return false
      // At least one lowercase letter
      if (!/[a-z]/.test(password)) return false
      // At least one number
      if (!/\d/.test(password)) return false
      // At least one special character
      if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) return false
      return true
    },
    {
      message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    }
  )

export const phoneSchema = z.string()
  .regex(/^\+?[\d\s\-\(\)]+$/, 'Invalid phone number format')
  .transform(sanitizeString)

export const urlSchema = z.string()
  .url('Invalid URL format')
  .transform(sanitizeString)

export const ipAddressSchema = z.string()
  .regex(
    /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$|^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/,
    'Invalid IP address format'
  )

export const domainSchema = z.string()
  .regex(/^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/, 'Invalid domain format')
  .transform(sanitizeString)

// Sanitization functions
export function sanitizeString(input: string): string {
  if (typeof input !== 'string') return ''
  
  return DOMPurify.sanitize(input, { 
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true
  }).trim()
}

export function sanitizeHTML(input: string, allowedTags: string[] = []): string {
  if (typeof input !== 'string') return ''
  
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: allowedTags,
    ALLOWED_ATTR: ['href', 'title', 'alt', 'class', 'id'],
    ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i
  })
}

export function stripSpecialChars(input: string): string {
  return input.replace(/[^\w\s.-]/g, '')
}

export function normalizeWhitespace(input: string): string {
  return input.replace(/\s+/g, ' ').trim()
}

// Input validation for common attack patterns
export function detectSQLInjection(input: string): boolean {
  const sqlPatterns = [
    /('|(\\')|(;")|(\|)|(\*)|(%27)|(%3D)|(%3B)|(%7C)/i,
    /(\bUNION\b.*\bSELECT\b)|(\bSELECT\b.*\bFROM\b)|(\bDROP\b.*\bTABLE\b)/i,
    /(\bINSERT\b.*\bINTO\b)|(\bUPDATE\b.*\bSET\b)|(\bDELETE\b.*\bFROM\b)/i,
    /(\bEXEC\b|\bEXECUTE\b).*(\bsp_|xp_)/i
  ]
  
  return sqlPatterns.some(pattern => pattern.test(input))
}

export function detectXSS(input: string): boolean {
  const xssPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<\s*\w.*>/gi
  ]
  
  return xssPatterns.some(pattern => pattern.test(input))
}

export function detectCommandInjection(input: string): boolean {
  const commandPatterns = [
    /[;&|`$]/,
    /\.\./,
    /(cat|ls|pwd|whoami|id|uname|wget|curl|nc|telnet|ssh)/i
  ]
  
  return commandPatterns.some(pattern => pattern.test(input))
}

export function detectPathTraversal(input: string): boolean {
  const pathPatterns = [
    /\.\.\//,
    /\.\.\\/,
    /%2e%2e%2f/i,
    /%2e%2e%5c/i,
    /\.\.%2f/i,
    /\.\.%5c/i
  ]
  
  return pathPatterns.some(pattern => pattern.test(input))
}

// Security validation middleware
export function validateSecurityThreats(input: any): string[] {
  const threats: string[] = []
  
  if (typeof input === 'string') {
    if (detectSQLInjection(input)) threats.push('SQL injection detected')
    if (detectXSS(input)) threats.push('XSS attempt detected')
    if (detectCommandInjection(input)) threats.push('Command injection detected')
    if (detectPathTraversal(input)) threats.push('Path traversal detected')
  } else if (typeof input === 'object' && input !== null) {
    // Recursively check object properties
    for (const [key, value] of Object.entries(input)) {
      threats.push(...validateSecurityThreats(value))
    }
  }
  
  return threats
}

// File upload validation
export function validateFileUpload(file: File, options: {
  maxSizeBytes?: number
  allowedTypes?: string[]
  allowedExtensions?: string[]
} = {}): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  const {
    maxSizeBytes = 5 * 1024 * 1024, // 5MB default
    allowedTypes = [],
    allowedExtensions = []
  } = options

  // Check file size
  if (file.size > maxSizeBytes) {
    errors.push(`File size exceeds limit of ${Math.round(maxSizeBytes / 1024 / 1024)}MB`)
  }

  // Check MIME type
  if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
    errors.push(`File type ${file.type} is not allowed`)
  }

  // Check file extension
  if (allowedExtensions.length > 0) {
    const extension = file.name.split('.').pop()?.toLowerCase()
    if (!extension || !allowedExtensions.includes(extension)) {
      errors.push(`File extension ${extension} is not allowed`)
    }
  }

  // Check for dangerous file names
  if (/[<>:"|?*]/.test(file.name)) {
    errors.push('File name contains invalid characters')
  }

  // Check for double extensions (potential bypass attempt)
  const extensionMatches = file.name.match(/\.[a-zA-Z0-9]{1,4}\.[a-zA-Z0-9]{1,4}$/g)
  if (extensionMatches && extensionMatches.length > 0) {
    errors.push('File name with double extension is not allowed')
  }

  return {
    valid: errors.length === 0,
    errors
  }
}

// Rate limiting helpers
export interface RateLimitConfig {
  windowMs: number
  maxRequests: number
  keyGenerator?: (input: any) => string
}

export class RateLimiter {
  private store = new Map<string, { count: number; resetTime: number }>()

  check(key: string, config: RateLimitConfig): { allowed: boolean; resetTime: number; remainingRequests: number } {
    const now = Date.now()
    const windowStart = now - config.windowMs
    
    // Clean up old entries
    this.cleanup(windowStart)
    
    let rateLimitData = this.store.get(key)
    
    if (!rateLimitData || rateLimitData.resetTime < now) {
      rateLimitData = { count: 0, resetTime: now + config.windowMs }
    }
    
    const allowed = rateLimitData.count < config.maxRequests
    
    if (allowed) {
      rateLimitData.count++
      this.store.set(key, rateLimitData)
    }
    
    return {
      allowed,
      resetTime: rateLimitData.resetTime,
      remainingRequests: Math.max(0, config.maxRequests - rateLimitData.count)
    }
  }
  
  private cleanup(cutoffTime: number) {
    for (const [key, data] of this.store.entries()) {
      if (data.resetTime < cutoffTime) {
        this.store.delete(key)
      }
    }
  }
}

export const globalRateLimiter = new RateLimiter()
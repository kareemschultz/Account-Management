import { NextRequest, NextResponse } from 'next/server'
import { withApiAuth } from '@/lib/api-auth'
import { withCSRFProtection } from '@/lib/csrf-protection'
import { passwordSchema } from '@/lib/input-validation'
import { logAuditEvent, logSecurityEvent } from '@/lib/audit'
import { pool } from '@/lib/auth'
import { z } from 'zod'
import bcrypt from 'bcryptjs'

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: passwordSchema,
  confirmPassword: z.string()
}).refine(
  (data) => data.newPassword === data.confirmPassword,
  {
    message: "Passwords don't match",
    path: ["confirmPassword"]
  }
)

export const POST = withCSRFProtection(
  withApiAuth(
    async (request: NextRequest, { user, validatedData }) => {
      const passwordData = validatedData as z.infer<typeof changePasswordSchema>
      const clientIP = request.headers.get('x-forwarded-for') || request.ip || '127.0.0.1'
      const userAgent = request.headers.get('user-agent') || 'unknown'

      try {
        const client = await pool.connect()
        try {
          // Get current user data
          const userResult = await client.query(
            'SELECT password_hash, login_attempts, locked_until FROM users WHERE id = $1',
            [parseInt(user.id)]
          )

          if (userResult.rows.length === 0) {
            await logSecurityEvent({
              user_id: parseInt(user.id),
              event_type: 'password_change_failed',
              ip_address: clientIP,
              user_agent: userAgent,
              details: { reason: 'user_not_found' },
              blocked: true
            })

            return NextResponse.json(
              { error: 'User not found' },
              { status: 404 }
            )
          }

          const userData = userResult.rows[0]

          // Check if account is locked
          if (userData.locked_until && new Date(userData.locked_until) > new Date()) {
            await logSecurityEvent({
              user_id: parseInt(user.id),
              event_type: 'password_change_failed',
              ip_address: clientIP,
              user_agent: userAgent,
              details: { reason: 'account_locked', locked_until: userData.locked_until },
              blocked: true
            })

            return NextResponse.json(
              { error: 'Account is temporarily locked' },
              { status: 423 }
            )
          }

          // Verify current password
          const isCurrentPasswordValid = await bcrypt.compare(
            passwordData.currentPassword, 
            userData.password_hash
          )

          if (!isCurrentPasswordValid) {
            // Increment login attempts for failed password verification
            const newAttempts = userData.login_attempts + 1
            const lockUntil = newAttempts >= 5 ? new Date(Date.now() + 15 * 60 * 1000) : null

            await client.query(
              'UPDATE users SET login_attempts = $1, locked_until = $2 WHERE id = $3',
              [newAttempts, lockUntil, parseInt(user.id)]
            )

            await logSecurityEvent({
              user_id: parseInt(user.id),
              event_type: 'password_change_failed',
              ip_address: clientIP,
              user_agent: userAgent,
              details: { 
                reason: 'invalid_current_password',
                attempts: newAttempts,
                locked: !!lockUntil
              },
              blocked: true,
              risk_score: 40
            })

            return NextResponse.json(
              { error: 'Current password is incorrect' },
              { status: 401 }
            )
          }

          // Check if new password is same as current
          const isSamePassword = await bcrypt.compare(
            passwordData.newPassword,
            userData.password_hash
          )

          if (isSamePassword) {
            await logSecurityEvent({
              user_id: parseInt(user.id),
              event_type: 'password_change_failed',
              ip_address: clientIP,
              user_agent: userAgent,
              details: { reason: 'same_as_current_password' },
              blocked: true
            })

            return NextResponse.json(
              { error: 'New password must be different from current password' },
              { status: 400 }
            )
          }

          // Hash new password
          const saltRounds = parseInt(process.env.BCRYPT_ROUNDS || '12')
          const hashedPassword = await bcrypt.hash(passwordData.newPassword, saltRounds)

          // Update password and reset login attempts
          await client.query(
            `UPDATE users 
             SET password_hash = $1, login_attempts = 0, locked_until = NULL, updated_at = NOW()
             WHERE id = $2`,
            [hashedPassword, parseInt(user.id)]
          )

          // Log successful password change
          await logAuditEvent({
            user_id: parseInt(user.id),
            target_type: 'user',
            target_id: parseInt(user.id),
            action: 'password_changed',
            performed_by: parseInt(user.id),
            ip_address: clientIP,
            user_agent: userAgent,
            category: 'security',
            description: 'User changed their password',
            severity: 'info'
          })

          await logSecurityEvent({
            user_id: parseInt(user.id),
            event_type: 'password_changed',
            ip_address: clientIP,
            user_agent: userAgent,
            details: { method: 'self_service' },
            blocked: false,
            risk_score: 0
          })

          return NextResponse.json({
            message: 'Password changed successfully'
          })

        } finally {
          client.release()
        }
      } catch (error) {
        console.error('Password change error:', error)

        await logSecurityEvent({
          user_id: parseInt(user.id),
          event_type: 'password_change_error',
          ip_address: clientIP,
          user_agent: userAgent,
          details: { 
            error: error instanceof Error ? error.message : 'Unknown error'
          },
          blocked: false
        })

        return NextResponse.json(
          { error: 'Failed to change password' },
          { status: 500 }
        )
      }
    },
    {
      requireAuth: true,
      validateInput: changePasswordSchema,
      rateLimit: { windowMs: 300000, maxRequests: 5 } // 5 requests per 5 minutes
    }
  )
)
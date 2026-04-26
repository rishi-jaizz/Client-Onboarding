const { z } = require('zod');

// ─── Helper for empty strings ─────────────────────────────────────────────
const emptyToNull = z.literal('').transform(() => null);

// ─── Auth Schemas ────────────────────────────────────────────────────────
const signupSchema = z.object({
  email: z.string().email('Invalid email address').toLowerCase(),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
  firstName: z.string().min(1, 'First name is required').max(50, 'First name too long').trim(),
  lastName: z.string().min(1, 'Last name is required').max(50, 'Last name too long').trim(),
  phone: z.string().regex(/^\+?[\d\s\-()]{7,20}$/, 'Invalid phone number').optional().or(emptyToNull),
  company: z.string().max(100, 'Company name too long').optional().or(emptyToNull),
  industry: z.string().max(50, 'Industry too long').optional().or(emptyToNull),
  country: z.string().length(2, 'Country must be 2-letter ISO code').optional().or(emptyToNull),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address').toLowerCase(),
  password: z.string().min(1, 'Password is required'),
});

const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(8, 'New password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number')
    .regex(/[^A-Za-z0-9]/, 'Password must contain at least one special character'),
});

// ─── Profile Schemas ────────────────────────────────────────────────────
const updateClientSchema = z.object({
  firstName: z.string().min(1).max(50).trim().optional(),
  lastName: z.string().min(1).max(50).trim().optional(),
  phone: z.string().regex(/^\+?[\d\s\-()]{7,20}$/, 'Invalid phone number').optional().nullable().or(emptyToNull),
  company: z.string().max(100).optional().nullable().or(emptyToNull),
  industry: z.string().max(50).optional().nullable().or(emptyToNull),
  country: z.string().length(2, 'Country must be 2-letter ISO code').optional().nullable().or(emptyToNull),
});

const updateProfileSchema = z.object({
  businessType: z.string().max(50).optional().nullable().or(emptyToNull),
  taxId: z.string().max(50).optional().nullable().or(emptyToNull),
  website: z.string().url('Invalid URL').optional().nullable().or(emptyToNull),
  address: z.string().max(200).optional().nullable().or(emptyToNull),
  city: z.string().max(100).optional().nullable().or(emptyToNull),
  state: z.string().max(50).optional().nullable().or(emptyToNull),
  zipCode: z.string().max(20).optional().nullable().or(emptyToNull),
  bio: z.string().max(1000).optional().nullable().or(emptyToNull),
  annualRevenue: z.enum(['<100K', '100K-500K', '500K-1M', '1M-10M', '10M-100M', '>100M']).optional().nullable().or(emptyToNull),
  employeeCount: z.enum(['1-10', '11-50', '51-200', '201-500', '501-1000', '>1000']).optional().nullable().or(emptyToNull),
});

// ─── Onboarding Schemas ────────────────────────────────────────────────
const updateStepSchema = z.object({
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'SKIPPED']),
  metadata: z.record(z.unknown()).optional(),
});

const businessSetupSchema = z.object({
  businessType: z.string().min(1, 'Business type is required'),
  taxId: z.string().optional().or(emptyToNull),
  website: z.string().url('Invalid URL').optional().or(emptyToNull),
  address: z.string().optional().or(emptyToNull),
  city: z.string().optional().or(emptyToNull),
  state: z.string().optional().or(emptyToNull),
  zipCode: z.string().optional().or(emptyToNull),
  annualRevenue: z.enum(['<100K', '100K-500K', '500K-1M', '1M-10M', '10M-100M', '>100M']).optional().or(emptyToNull),
  employeeCount: z.enum(['1-10', '11-50', '51-200', '201-500', '501-1000', '>1000']).optional().or(emptyToNull),
});

module.exports = {
  signupSchema,
  loginSchema,
  refreshTokenSchema,
  changePasswordSchema,
  updateClientSchema,
  updateProfileSchema,
  updateStepSchema,
  businessSetupSchema,
};

import { z } from 'zod';

const emailField = z
  .string()
  .min(1, 'Email is required.')
  .email('Enter a valid email address.');

const passwordField = z
  .string()
  .min(1, 'Password is required.')
  .min(8, 'Password must be at least 8 characters.')
  .regex(/[a-z]/, 'Password must include a lowercase letter.')
  .regex(/[A-Z]/, 'Password must include an uppercase letter.')
  .regex(/[0-9]/, 'Password must include a number.');

export const loginSchema = z.object({
  email: emailField,
  password: z.string().min(1, 'Password is required.'),
});

export const jobSeekerSignupSchema = z
  .object({
    email: emailField,
    password: passwordField,
    confirmPassword: z.string().min(1, 'Please confirm your password.'),
    fullName: z.string().min(1, 'Full name is required.').max(120, 'Full name is too long.'),
    skills: z.string().max(500).optional().or(z.literal('')),
    yearsExperience: z
      .string()
      .optional()
      .or(z.literal(''))
      .refine((v) => !v || (!Number.isNaN(Number(v)) && Number(v) >= 0), {
        message: 'Years of experience must be a valid number.',
      }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  });

export const employerSignupSchema = z
  .object({
    email: emailField,
    password: passwordField,
    confirmPassword: z.string().min(1, 'Please confirm your password.'),
    companyName: z.string().min(1, 'Company name is required.').max(200),
    website: z.string().url('Enter a valid website URL.').optional().or(z.literal('')),
    industry: z.string().max(120).optional().or(z.literal('')),
    googleCompanyName: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  });

export const adminSignupSchema = z
  .object({
    email: emailField,
    password: passwordField,
    confirmPassword: z.string().min(1, 'Please confirm your password.'),
    displayName: z.string().min(1, 'Display name is required.').max(120),
    permissionLevel: z.enum(['standard', 'super']),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match.',
    path: ['confirmPassword'],
  });

export function zodFieldErrors(result) {
  if (result.success) return {};
  const errors = {};
  for (const issue of result.error.issues) {
    const key = issue.path[0];
    if (key && !errors[key]) errors[key] = issue.message;
  }
  return errors;
}

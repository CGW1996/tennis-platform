import { z } from 'zod';

// Common validation schemas
export const emailSchema = z.string().email('請輸入有效的電子郵件地址');

export const passwordSchema = z
  .string()
  .min(8, '密碼至少需要 8 個字符')
  .regex(/[A-Z]/, '密碼需要包含至少一個大寫字母')
  .regex(/[a-z]/, '密碼需要包含至少一個小寫字母')
  .regex(/[0-9]/, '密碼需要包含至少一個數字');

export const phoneSchema = z
  .string()
  .regex(/^09\d{8}$/, '請輸入有效的手機號碼 (09xxxxxxxx)');

export const ntrpLevelSchema = z
  .number()
  .min(1, 'NTRP 等級最低為 1.0')
  .max(7, 'NTRP 等級最高為 7.0')
  .refine((val) => val % 0.5 === 0, '請輸入 0.5 的倍數');

// Auth forms
export const loginFormSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, '請輸入密碼'),
});

export const registerFormSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
  name: z.string().min(2, '姓名至少需要 2 個字符'),
  phone: phoneSchema.optional(),
  ntrp_level: ntrpLevelSchema.optional(),
  terms: z.boolean().refine(val => val === true, '請同意服務條款'),
}).refine((data) => data.password === data.confirmPassword, {
  message: '密碼不一致',
  path: ['confirmPassword'],
});

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, '重設令牌無效'),
  password: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: '密碼不一致',
  path: ['confirmPassword'],
});

// Profile forms
export const profileFormSchema = z.object({
  name: z.string().min(2, '姓名至少需要 2 個字符'),
  bio: z.string().max(500, '個人簡介不能超過 500 字符').optional(),
  ntrp_level: ntrpLevelSchema,
  playing_style: z.enum(['aggressive', 'defensive', 'all-around'], {
    errorMap: () => ({ message: '請選擇打球風格' }),
  }).optional(),
  preferred_times: z.array(z.enum(['morning', 'afternoon', 'evening'])).optional(),
  location: z.object({
    latitude: z.number(),
    longitude: z.number(),
    address: z.string(),
  }).optional(),
  privacy_settings: z.object({
    show_location: z.boolean(),
    show_phone: z.boolean(),
    show_email: z.boolean(),
  }).optional(),
});

// Court search forms
export const courtSearchSchema = z.object({
  query: z.string().optional(),
  location: z.object({
    latitude: z.number(),
    longitude: z.number(),
  }).optional(),
  radius: z.number().min(1).max(50).optional(),
  price_range: z.object({
    min: z.number().min(0).optional(),
    max: z.number().min(0).optional(),
  }).optional(),
  facilities: z.array(z.string()).optional(),
  surface_type: z.enum(['hard', 'clay', 'grass', 'synthetic']).optional(),
});

// Booking forms
export const bookingFormSchema = z.object({
  court_id: z.string().min(1, '請選擇場地'),
  date: z.date({ required_error: '請選擇日期' }),
  start_time: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, '請輸入有效時間'),
  end_time: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, '請輸入有效時間'),
  notes: z.string().max(200, '備註不能超過 200 字符').optional(),
});

// Coach lesson forms
export const lessonBookingSchema = z.object({
  coach_id: z.string().min(1, '請選擇教練'),
  date: z.date({ required_error: '請選擇日期' }),
  start_time: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, '請輸入有效時間'),
  duration: z.number().min(30).max(180, '課程時間不能超過 3 小時'),
  lesson_type: z.enum(['individual', 'group'], {
    errorMap: () => ({ message: '請選擇課程類型' }),
  }),
  skill_focus: z.array(z.string()).optional(),
  notes: z.string().max(200, '備註不能超過 200 字符').optional(),
});

// Review forms
export const reviewFormSchema = z.object({
  rating: z.number().min(1, '請給予評分').max(5, '評分不能超過 5 星'),
  title: z.string().min(5, '標題至少需要 5 個字符').max(100, '標題不能超過 100 字符'),
  content: z.string().min(10, '評價內容至少需要 10 個字符').max(1000, '評價內容不能超過 1000 字符'),
  tags: z.array(z.string()).optional(),
});

// Matching preferences
export const matchingPreferencesSchema = z.object({
  ntrp_range: z.object({
    min: ntrpLevelSchema,
    max: ntrpLevelSchema,
  }),
  max_distance: z.number().min(1).max(50),
  // Deprecated but kept for backward compatibility
  preferred_times: z.array(z.enum(['morning', 'afternoon', 'evening'])).optional(),
  playing_style: z.enum(['aggressive', 'defensive', 'all-around']).optional(),
  age_range: z.object({
    min: z.number().min(16).max(80),
    max: z.number().min(16).max(80),
  }).optional(),
  // New fields
  location: z.object({
    city: z.string(),
    district: z.string().optional(),
  }).optional(),
  play_type: z.array(z.enum(['rally', 'singles', 'doubles'])).optional(),
  availability: z.array(z.object({
    type: z.enum(['weekday', 'weekend']),
    time: z.enum(['morning', 'afternoon', 'evening']),
  })).optional(),
  gender: z.enum(['male', 'female', 'any']).optional(),
});

// Type exports for forms
export type LoginForm = z.infer<typeof loginFormSchema>;
export type RegisterForm = z.infer<typeof registerFormSchema>;
export type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordForm = z.infer<typeof resetPasswordSchema>;
export type ProfileForm = z.infer<typeof profileFormSchema>;
export type CourtSearchForm = z.infer<typeof courtSearchSchema>;
export type BookingForm = z.infer<typeof bookingFormSchema>;
export type LessonBookingForm = z.infer<typeof lessonBookingSchema>;
export type ReviewForm = z.infer<typeof reviewFormSchema>;
export type MatchingPreferencesForm = z.infer<typeof matchingPreferencesSchema>;
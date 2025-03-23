// Google reCAPTCHA configuration
export const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || '';

// Helper functions
export const validateRecaptchaToken = (token: string | null): boolean => {
  // In a real app, you might want to make additional validations here
  return !!token; // Simple validation - just check if token exists
};
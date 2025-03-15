// Site configuration file
// This centralizes site-wide configuration values

// App info
export const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME || 'Pedigree Database';
export const SITE_DESCRIPTION = process.env.NEXT_PUBLIC_SITE_DESCRIPTION || 'Your comprehensive dog pedigree management system';
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://pedigree-db.example.com';

// Social links
export const TWITTER_HANDLE = process.env.NEXT_PUBLIC_TWITTER_HANDLE || '@pedigreedb';
export const FACEBOOK_URL = process.env.NEXT_PUBLIC_FACEBOOK_URL || 'https://facebook.com/pedigreedb';
export const INSTAGRAM_HANDLE = process.env.NEXT_PUBLIC_INSTAGRAM_HANDLE || '@pedigreedb';

// App settings
export const COPYRIGHT_TEXT = `© ${new Date().getFullYear()} ${SITE_NAME}. All rights reserved.`;

// Export combined default config
export default {
  SITE_NAME,
  SITE_DESCRIPTION,
  SITE_URL,
  TWITTER_HANDLE,
  FACEBOOK_URL,
  INSTAGRAM_HANDLE,
  COPYRIGHT_TEXT
};

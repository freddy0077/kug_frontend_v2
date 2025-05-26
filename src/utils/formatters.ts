// Utility functions for formatting data consistently across the application

/**
 * Format a date string or Date object into a user-friendly format
 * @param dateString ISO date string or Date object
 * @param options Additional format options
 * @returns Formatted date string
 */
export const formatDate = (
  dateString: string | Date | undefined | null,
  options: { includeTime?: boolean; locales?: string } = {}
): string => {
  if (!dateString) return 'N/A';

  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  const { includeTime = false, locales = 'en-US' } = options;

  try {
    if (includeTime) {
      return date.toLocaleString(locales, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    }

    return date.toLocaleDateString(locales, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch (error) {
    // Fallback in case of invalid date
    return 'Invalid Date';
  }
};

/**
 * Format a number as currency
 * @param value Number to format
 * @param currency Currency code (default: USD)
 * @returns Formatted currency string
 */
export const formatCurrency = (
  value: number | undefined | null,
  currency = 'USD'
): string => {
  if (value === undefined || value === null) return 'N/A';

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(value);
};

/**
 * Format a number with thousands separators
 * @param value Number to format
 * @returns Formatted number string
 */
export const formatNumber = (value: number | undefined | null): string => {
  if (value === undefined || value === null) return 'N/A';

  return new Intl.NumberFormat('en-US').format(value);
};

/**
 * Truncate a string if it exceeds the maximum length
 * @param str String to truncate
 * @param maxLength Maximum length before truncation
 * @param ellipsis String to append to truncated text
 * @returns Truncated string
 */
export const truncateString = (
  str: string | undefined | null,
  maxLength = 100,
  ellipsis = '...'
): string => {
  if (!str) return '';
  if (str.length <= maxLength) return str;

  return str.slice(0, maxLength) + ellipsis;
};

/**
 * Capitalize the first letter of each word in a string
 * @param str String to capitalize
 * @returns Capitalized string
 */
export const capitalizeWords = (str: string | undefined | null): string => {
  if (!str) return '';

  return str
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

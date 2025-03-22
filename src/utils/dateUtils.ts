/**
 * Format a date string to a more readable format
 * @param dateString - The date string to format
 * @param options - Intl.DateTimeFormatOptions
 * @returns Formatted date string
 */
export const formatDate = (
  dateString?: string | null,
  options: Intl.DateTimeFormatOptions = { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  }
): string => {
  if (!dateString) return 'No date';
  
  try {
    const date = new Date(dateString);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }
    
    return new Intl.DateTimeFormat('en-US', options).format(date);
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid date';
  }
};

/**
 * Format a date string to a standard format (Month Day, Year)
 * This is an alias for formatDate with specific options
 * @param dateString - The date string to format
 * @returns Formatted date string in "Month Day, Year" format
 */
export const formatDateStr = (
  dateString?: string | null
): string => {
  return formatDate(dateString, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

/**
 * Check if a date is in the past
 * @param dateString - The date string to check
 * @returns Boolean indicating if the date is in the past
 */
export const isDateInPast = (dateString?: string | null): boolean => {
  if (!dateString) return false;
  
  try {
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return date < today;
  } catch (error) {
    return false;
  }
};

/**
 * Calculate the difference in days between two dates
 * @param dateString1 - First date
 * @param dateString2 - Second date (defaults to current date)
 * @returns Number of days between the dates
 */
export const daysBetweenDates = (
  dateString1?: string | null,
  dateString2?: string | null
): number => {
  if (!dateString1) return 0;
  
  try {
    const date1 = new Date(dateString1);
    const date2 = dateString2 ? new Date(dateString2) : new Date();
    
    // Convert both dates to midnight UTC to get accurate day difference
    const utcDate1 = Date.UTC(date1.getFullYear(), date1.getMonth(), date1.getDate());
    const utcDate2 = Date.UTC(date2.getFullYear(), date2.getMonth(), date2.getDate());
    
    // Calculate difference in days
    return Math.floor((utcDate2 - utcDate1) / (1000 * 60 * 60 * 24));
  } catch (error) {
    return 0;
  }
};

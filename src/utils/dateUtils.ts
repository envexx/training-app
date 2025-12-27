/**
 * Utility functions for date formatting and conversion
 */

/**
 * Convert date string to YYYY-MM-DD format for HTML date input
 * @param date - Date string or Date object
 * @returns Formatted date string (YYYY-MM-DD) or empty string
 */
export const formatDateForInput = (date: string | Date | null | undefined): string => {
  if (!date) return '';
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return '';
    
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
  } catch (error) {
    console.error('Error formatting date for input:', error);
    return '';
  }
};

/**
 * Format date to display format (dd/mm/yyyy for Indonesia)
 * @param date - Date string or Date object
 * @returns Formatted date string (dd/mm/yyyy) or empty string
 */
export const formatDateForDisplay = (date: string | Date | null | undefined): string => {
  if (!date) return '';
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return '';
    
    const day = String(dateObj.getDate()).padStart(2, '0');
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const year = dateObj.getFullYear();
    
    return `${day}/${month}/${year}`;
  } catch (error) {
    console.error('Error formatting date for display:', error);
    return '';
  }
};

/**
 * Format date to locale string (Indonesian format)
 * @param date - Date string or Date object
 * @returns Formatted date string in Indonesian locale
 */
export const formatDateLocale = (date: string | Date | null | undefined): string => {
  if (!date) return '';
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return '';
    
    return dateObj.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  } catch (error) {
    console.error('Error formatting date locale:', error);
    return '';
  }
};

/**
 * Parse date string from various formats to Date object
 * @param dateString - Date string in various formats
 * @returns Date object or null if invalid
 */
export const parseDate = (dateString: string | null | undefined): Date | null => {
  if (!dateString) return null;
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return null;
    return date;
  } catch (error) {
    console.error('Error parsing date:', error);
    return null;
  }
};


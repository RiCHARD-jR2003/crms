/**
 * Standardized Date/Time Formatting Utility
 * Format: MM/DD/YYYY HH:mm:ss AM/PM
 */

/**
 * Format date and time in standard format: MM/DD/YYYY HH:mm:ss AM/PM
 * @param {string|Date} dateString - Date string or Date object
 * @returns {string} Formatted date string
 */
export const formatDateTime = (dateString) => {
  if (!dateString) return 'N/A';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid Date';
    
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    
    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    const hoursStr = String(hours).padStart(2, '0');
    
    return `${month}/${day}/${year} ${hoursStr}:${minutes}:${seconds} ${ampm}`;
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid Date';
  }
};

/**
 * Format date only: MM/DD/YYYY
 * @param {string|Date} dateString - Date string or Date object
 * @returns {string} Formatted date string
 */
export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid Date';
    
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    
    return `${month}/${day}/${year}`;
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid Date';
  }
};

/**
 * Format time only: HH:mm:ss AM/PM
 * @param {string|Date} dateString - Date string or Date object
 * @returns {string} Formatted time string
 */
export const formatTime = (dateString) => {
  if (!dateString) return 'N/A';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid Date';
    
    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const hoursStr = String(hours).padStart(2, '0');
    
    return `${hoursStr}:${minutes}:${seconds} ${ampm}`;
  } catch (error) {
    console.error('Error formatting time:', error);
    return 'Invalid Date';
  }
};

/**
 * Get current date/time in standardized format
 * @returns {string} Current date/time formatted
 */
export const getCurrentDateTime = () => {
  return formatDateTime(new Date());
};

/**
 * Get real-time timestamp (ISO format for backend)
 * @returns {string} ISO timestamp
 */
export const getRealTimeTimestamp = () => {
  return new Date().toISOString();
};


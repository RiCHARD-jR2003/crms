// Utility function to format names with suffix
export const formatFullName = (firstName, middleName, lastName, suffix) => {
  const parts = [];
  
  if (firstName) parts.push(firstName);
  if (middleName) parts.push(middleName);
  if (lastName) parts.push(lastName);
  if (suffix) parts.push(suffix);
  
  return parts.join(' ').trim();
};

// Utility function to format name in "Last, First Middle Suffix" format
export const formatNameLastFirst = (firstName, middleName, lastName, suffix) => {
  const parts = [];
  
  if (lastName) parts.push(lastName);
  if (firstName) parts.push(firstName);
  if (middleName) parts.push(middleName);
  if (suffix) parts.push(suffix);
  
  return parts.join(' ').trim();
};

// Utility function to format name in "First Middle Last Suffix" format
export const formatNameFirstLast = (firstName, middleName, lastName, suffix) => {
  const parts = [];
  
  if (firstName) parts.push(firstName);
  if (middleName) parts.push(middleName);
  if (lastName) parts.push(lastName);
  if (suffix) parts.push(suffix);
  
  return parts.join(' ').trim();
};

// Utility function to get initials from name
export const getInitials = (firstName, lastName) => {
  return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase();
};

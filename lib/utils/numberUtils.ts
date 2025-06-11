/**
 * Formats a number with commas as thousands separators
 * @param value - The number or string to format
 * @returns Formatted string with commas
 */
export const formatNumberWithCommas = (value: string | number): string => {
  if (!value) return '';

  // Remove all non-digit characters except decimal point
  const cleanValue = value.toString().replace(/[^\d.]/g, '');

  // Split by decimal point
  const parts = cleanValue.split('.');

  // Add commas to the integer part
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  // Join back with decimal point if there was one
  return parts.join('.');
};

/**
 * Removes commas from a formatted number string
 * @param value - The formatted string with commas
 * @returns Clean number string without commas
 */
export const removeCommasFromNumber = (value: string): string => {
  return value.replace(/,/g, '');
};

/**
 * Converts a formatted number string to a float
 * @param value - The formatted string with commas
 * @returns Parsed float value
 */
export const parseFormattedNumber = (value: string): number => {
  const cleanValue = removeCommasFromNumber(value);
  return parseFloat(cleanValue) || 0;
};

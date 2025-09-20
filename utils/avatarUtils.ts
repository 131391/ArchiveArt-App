/**
 * Utility functions for handling user avatars and profile pictures
 */

/**
 * Generate initials from a user's name
 * @param name - The user's full name
 * @returns The initials (e.g., "John Doe" -> "JD")
 */
export const generateInitials = (name: string): string => {
  if (!name || typeof name !== 'string') {
    return 'U'; // Default to 'U' for User
  }

  const words = name.trim().split(/\s+/);
  
  if (words.length === 0) {
    return 'U';
  }
  
  if (words.length === 1) {
    // Single name - take first two characters
    return words[0].substring(0, 2).toUpperCase();
  }
  
  // Multiple words - take first character of first and last word
  const firstInitial = words[0].charAt(0).toUpperCase();
  const lastInitial = words[words.length - 1].charAt(0).toUpperCase();
  
  return firstInitial + lastInitial;
};

/**
 * Get avatar props for displaying user profile picture or default avatar
 * @param user - User object with name and optional profile_picture
 * @returns Object with avatar configuration
 */
export const getAvatarProps = (user: { name: string; profile_picture?: string }) => {
  const hasProfilePicture = user.profile_picture && user.profile_picture.trim() !== '';
  
  const result = {
    hasProfilePicture,
    profilePictureUrl: hasProfilePicture ? user.profile_picture : null,
    defaultAvatarUrl: require('@/assets/images/ALogo-square.png'),
    initials: generateInitials(user.name),
  };
  
  return result;
};

/**
 * Parse phone number to remove country code and return local number
 * @param phoneNumber - Phone number with or without country code
 * @returns Local phone number without country code
 */
export const parseLocalPhoneNumber = (phoneNumber: string): string => {
  if (!phoneNumber) return '';
  
  // Remove all non-digits first
  let cleanedMobile = phoneNumber.replace(/\D/g, '');
  
  // Handle common country codes
  if (cleanedMobile.startsWith('91') && cleanedMobile.length === 12) {
    // Indian number with +91 prefix
    return cleanedMobile.substring(2); // Remove '91'
  } else if (cleanedMobile.startsWith('1') && cleanedMobile.length === 11) {
    // US number with +1 prefix
    return cleanedMobile.substring(1); // Remove '1'
  } else if (cleanedMobile.length > 10) {
    // Generic: if longer than 10 digits, assume first digits are country code
    return cleanedMobile.slice(-10); // Take last 10 digits
  } else {
    // Already a local number
    return cleanedMobile;
  }
};

/**
 * Get background color for initials avatar based on user ID
 * @param userId - User ID to generate consistent color
 * @returns Background color string
 */
export const getInitialsBackgroundColor = (userId: number): string => {
  const colors = [
    '#3B82F6', // Blue
    '#8B5CF6', // Purple
    '#EF4444', // Red
    '#10B981', // Green
    '#F59E0B', // Yellow
    '#EC4899', // Pink
    '#06B6D4', // Cyan
    '#84CC16', // Lime
    '#F97316', // Orange
    '#6366F1', // Indigo
  ];
  
  return colors[userId % colors.length];
};

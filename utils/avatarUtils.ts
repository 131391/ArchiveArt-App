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
 * Get avatar props for displaying user profile picture or initials
 * @param user - User object with name and optional profile_picture
 * @returns Object with avatar configuration
 */
export const getAvatarProps = (user: { name: string; profile_picture?: string }) => {
  // Debug logging to see what data we're receiving
  console.log('🔍 getAvatarProps - User data:', {
    name: user.name,
    profile_picture: user.profile_picture,
    profile_picture_type: typeof user.profile_picture,
    profile_picture_length: user.profile_picture?.length,
  });
  
  const hasProfilePicture = user.profile_picture && user.profile_picture.trim() !== '';
  
  const result = {
    hasProfilePicture,
    profilePictureUrl: hasProfilePicture ? user.profile_picture : null,
    initials: generateInitials(user.name),
  };
  
  console.log('🔍 getAvatarProps - Result:', result);
  
  return result;
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

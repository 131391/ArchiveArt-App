/**
 * Example usage of the comprehensive API configuration
 * This file demonstrates how to use the centralized API constants and utilities
 */

import {
    API_ENDPOINTS,
    API_STATUS,
    RATE_LIMITS,
    TOKEN_CONFIG,
    buildUrl,
    createApiRequest,
    handleApiError,
    validateEmail,
    validateMobile,
    validatePassword
} from '@/constants/Api';

// Example 1: Basic API call with error handling
export async function loginUser(email: string, password: string) {
  try {
    // Validate input before making API call
    if (!validateEmail(email)) {
      throw new Error('Please enter a valid email address');
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      throw new Error(passwordValidation.errors.join(', '));
    }

    // Create API request
    const { url, config } = createApiRequest(
      'POST',
      API_ENDPOINTS.AUTH.LOGIN,
      { email, password }
    );

    // Make the request
    const response = await fetch(url, config);

    if (!response.ok) {
      const errorData = await response.json();
      const userMessage = handleApiError(response, errorData);
      throw new Error(userMessage);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
}

// Example 2: Register user with comprehensive validation
export async function registerUser(userData: {
  name: string;
  email: string;
  password: string;
  mobile?: string;
}) {
  try {
    // Validate all inputs
    if (!userData.name || userData.name.length < 2) {
      throw new Error('Name must be at least 2 characters long');
    }

    if (!validateEmail(userData.email)) {
      throw new Error('Please enter a valid email address');
    }

    const passwordValidation = validatePassword(userData.password);
    if (!passwordValidation.isValid) {
      throw new Error(passwordValidation.errors.join(', '));
    }

    if (userData.mobile && !validateMobile(userData.mobile)) {
      throw new Error('Please enter a valid mobile number with country code (e.g., +1234567890)');
    }

    // Create API request
    const { url, config } = createApiRequest(
      'POST',
      API_ENDPOINTS.AUTH.REGISTER,
      userData
    );

    // Make the request
    const response = await fetch(url, config);

    if (!response.ok) {
      const errorData = await response.json();
      const userMessage = handleApiError(response, errorData);
      throw new Error(userMessage);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
}

// Example 3: Authenticated API call
export async function getUserProfile(accessToken: string) {
  try {
    const { url, config } = createApiRequest(
      'GET',
      API_ENDPOINTS.AUTH.PROFILE,
      undefined,
      accessToken
    );

    const response = await fetch(url, config);

    if (!response.ok) {
      const errorData = await response.json();
      const userMessage = handleApiError(response, errorData);
      throw new Error(userMessage);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Get profile error:', error);
    throw error;
  }
}

// Example 4: Media scan with proper error handling
export async function scanMedia(imageData: FormData, accessToken: string) {
  try {
    const url = buildUrl(API_ENDPOINTS.MEDIA.MATCH);
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        // Don't set Content-Type for FormData - let browser set it with boundary
      },
      body: imageData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      const userMessage = handleApiError(response, errorData);
      throw new Error(userMessage);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Media scan error:', error);
    throw error;
  }
}

// Example 5: Token refresh
export async function refreshAccessToken(refreshToken: string) {
  try {
    const { url, config } = createApiRequest(
      'POST',
      API_ENDPOINTS.AUTH.REFRESH,
      { refreshToken }
    );

    const response = await fetch(url, config);

    if (!response.ok) {
      const errorData = await response.json();
      const userMessage = handleApiError(response, errorData);
      throw new Error(userMessage);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Token refresh error:', error);
    throw error;
  }
}

// Example 6: Rate limiting awareness
export function checkRateLimit(response: Response): boolean {
  if (response.status === API_STATUS.TOO_MANY_REQUESTS) {
    console.warn('Rate limit exceeded. Please wait before making more requests.');
    return true;
  }
  return false;
}

// Example 7: Configuration usage
export function getApiConfiguration() {
  return {
    baseUrl: buildUrl(''),
    rateLimits: RATE_LIMITS,
    tokenConfig: TOKEN_CONFIG,
    endpoints: API_ENDPOINTS,
  };
}

// Example 8: Validation utilities
export function validateUserInput(input: {
  name?: string;
  email?: string;
  password?: string;
  mobile?: string;
}) {
  const errors: string[] = [];

  if (input.name && input.name.length < 2) {
    errors.push('Name must be at least 2 characters long');
  }

  if (input.email && !validateEmail(input.email)) {
    errors.push('Please enter a valid email address');
  }

  if (input.password) {
    const passwordValidation = validatePassword(input.password);
    if (!passwordValidation.isValid) {
      errors.push(...passwordValidation.errors);
    }
  }

  if (input.mobile && !validateMobile(input.mobile)) {
    errors.push('Please enter a valid mobile number with country code');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

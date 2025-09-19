/**
 * API Configuration
 * 
 * This file centralizes all API endpoints, configuration, and utilities for the ArchivArt app.
 * Based on the comprehensive API documentation provided.
 * 
 * Features:
 * - Centralized endpoint management
 * - Type-safe API calls
 * - Error handling utilities
 * - Validation functions
 * - Rate limiting configuration
 * - Token management
 * 
 * Usage Examples:
 * 
 * 1. Using endpoint constants:
 *    import { API_ENDPOINTS, buildUrl } from '@/constants/Api';
 *    const loginUrl = buildUrl(API_ENDPOINTS.AUTH.LOGIN);
 * 
 * 2. Using the createApiRequest helper:
 *    import { createApiRequest, HTTP_METHODS } from '@/constants/Api';
 *    const { url, config } = createApiRequest('POST', API_ENDPOINTS.AUTH.LOGIN, loginData, token);
 *    const response = await fetch(url, config);
 * 
 * 3. Error handling:
 *    import { handleApiError, API_STATUS } from '@/constants/Api';
 *    if (!response.ok) {
 *      const errorData = await response.json();
 *      const userMessage = handleApiError(response, errorData);
 *      console.error(userMessage);
 *    }
 * 
 * 4. Validation:
 *    import { validateEmail, validatePassword } from '@/constants/Api';
 *    const isEmailValid = validateEmail('user@example.com');
 *    const passwordValidation = validatePassword('MyPass123!');
 * 
 * 5. Direct endpoint usage:
 *    const response = await fetch(buildUrl(API_ENDPOINTS.MEDIA.MATCH), { ... });
 */

export const API_CONFIG = {
  // BASE_URL: 'https://archivart.onrender.com',
  BASE_URL: 'http://172.20.10.5:3000',
  // Enable mock mode for development when backend is not available
  MOCK_MODE: false, // Changed to false to test with real APIs
};

// API Endpoints organized by category
export const API_ENDPOINTS = {
  // Authentication endpoints (based on API documentation)
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    REFRESH: '/api/auth/refresh',
    LOGOUT: '/api/auth/logout',
    PROFILE: '/api/auth/profile',
    UPDATE_PROFILE: '/api/auth/profile', // PUT method
    SOCIAL_LOGIN: '/api/auth/social-login',
    FORGOT_PASSWORD: '/api/auth/forgot-password',
    RESET_PASSWORD: '/api/auth/reset-password',
    VERIFY_EMAIL: '/api/auth/verify-email',
  },
  
  // Media endpoints
  MEDIA: {
    MATCH: '/api/media/match',
    UPLOAD: '/api/media/upload',
    SEARCH: '/api/media/search',
    DETAILS: '/api/media/details',
    FAVORITES: '/api/media/favorites',
    HISTORY: '/api/media/history',
  },
  
  // User endpoints
  USER: {
    PROFILE: '/api/user/profile',
    UPDATE_PROFILE: '/api/user/update-profile',
    CHANGE_PASSWORD: '/api/user/change-password',
    DELETE_ACCOUNT: '/api/user/delete-account',
    PREFERENCES: '/api/user/preferences',
  },
  
  // Scanner endpoints
  SCANNER: {
    SCAN: '/api/scanner/scan',
    PROCESS: '/api/scanner/process',
    HISTORY: '/api/scanner/history',
  },
  
  // Analytics endpoints
  ANALYTICS: {
    USAGE: '/api/analytics/usage',
    SCAN_STATS: '/api/analytics/scan-stats',
    USER_ACTIVITY: '/api/analytics/user-activity',
  },
} as const;

// Type definitions for better TypeScript support
export type ApiEndpoint = typeof API_ENDPOINTS;
export type AuthEndpoint = ApiEndpoint['AUTH'];
export type MediaEndpoint = ApiEndpoint['MEDIA'];
export type UserEndpoint = ApiEndpoint['USER'];
export type ScannerEndpoint = ApiEndpoint['SCANNER'];
export type AnalyticsEndpoint = ApiEndpoint['ANALYTICS'];

// HTTP Methods
export const HTTP_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  PATCH: 'PATCH',
  DELETE: 'DELETE',
} as const;

// API Response status codes
export const API_STATUS = {
  SUCCESS: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
} as const;

// Request timeout configuration
export const REQUEST_CONFIG = {
  TIMEOUT: 30000, // 30 seconds
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // 1 second
} as const;

// Rate limiting configuration (based on API documentation)
export const RATE_LIMITS = {
  AUTH: {
    REQUESTS_PER_WINDOW: 5,
    WINDOW_MINUTES: 15,
  },
  REFRESH_LOGOUT: {
    REQUESTS_PER_WINDOW: 3,
    WINDOW_MINUTES: 15,
  },
  GENERAL_API: {
    REQUESTS_PER_WINDOW: 100,
    WINDOW_MINUTES: 15,
  },
} as const;

// Token configuration (based on API documentation)
export const TOKEN_CONFIG = {
  ACCESS_TOKEN_EXPIRY: 900, // 15 minutes in seconds
  REFRESH_TOKEN_EXPIRY: 2592000, // 30 days in seconds
} as const;

// Common error messages (based on API documentation)
export const ERROR_MESSAGES = {
  VALIDATION_FAILED: 'Validation failed',
  INVALID_CREDENTIALS: 'Invalid credentials',
  USER_ALREADY_EXISTS: 'User already exists with this email',
  USERNAME_TAKEN: 'Username is already taken',
  MOBILE_REGISTERED: 'Mobile number is already registered',
  PASSWORD_REQUIREMENTS: 'Password does not meet security requirements',
  ACCOUNT_INACTIVE: 'Account is inactive or blocked',
  IP_BLOCKED: 'Access denied - IP address is blocked',
  EMAIL_BLOCKED: 'Access denied - Email address is blocked',
  RATE_LIMITED: 'Too many authentication attempts, please try again later',
  INVALID_REFRESH_TOKEN: 'Invalid or expired refresh token',
  NETWORK_ERROR: 'Network error. Please check your internet connection.',
  SERVER_ERROR: 'Internal server error. Please try again later.',
} as const;

/**
 * Builds a complete URL from a path
 * @param path - The API endpoint path
 * @returns Complete URL string
 */
export function buildUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) return path;
  
  // In mock mode, return a placeholder URL that won't be used
  if (API_CONFIG.MOCK_MODE) {
    return `http://localhost:3000${path.startsWith('/') ? '' : '/'}${path}`;
  }
  
  return `${API_CONFIG.BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
}

/**
 * Gets the full URL for an API endpoint
 * @param endpoint - The endpoint path
 * @returns Complete URL string
 */
export function getApiUrl(endpoint: string): string {
  return buildUrl(endpoint);
}

/**
 * Creates a standardized API request configuration
 * @param method - HTTP method
 * @param endpoint - API endpoint
 * @param data - Request body data (optional)
 * @param token - Authentication token (optional)
 * @returns Fetch configuration object
 */
export function createApiRequest(
  method: keyof typeof HTTP_METHODS,
  endpoint: string,
  data?: any,
  token?: string
) {
  const config: RequestInit = {
    method: HTTP_METHODS[method],
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    ...(data && { body: JSON.stringify(data) }),
  };

  return {
    url: getApiUrl(endpoint),
    config,
  };
}

/**
 * Handles API response errors based on the API documentation
 * @param response - Fetch response object
 * @param responseData - Parsed response data
 * @returns User-friendly error message
 */
export function handleApiError(response: Response, responseData?: any): string {
  const status = response.status;
  const errorData = responseData || {};

  switch (status) {
    case API_STATUS.BAD_REQUEST:
      if (errorData.error === ERROR_MESSAGES.VALIDATION_FAILED) {
        return 'Please check your input and try again.';
      }
      if (errorData.error === ERROR_MESSAGES.USER_ALREADY_EXISTS) {
        return 'An account with this email already exists.';
      }
      if (errorData.error === ERROR_MESSAGES.USERNAME_TAKEN) {
        return 'This username is already taken.';
      }
      if (errorData.error === ERROR_MESSAGES.MOBILE_REGISTERED) {
        return 'This mobile number is already registered.';
      }
      if (errorData.error === ERROR_MESSAGES.PASSWORD_REQUIREMENTS) {
        return 'Password must contain uppercase, lowercase, number, and special character.';
      }
      return errorData.error || 'Invalid request. Please check your input.';

    case API_STATUS.UNAUTHORIZED:
      if (errorData.error === ERROR_MESSAGES.INVALID_CREDENTIALS) {
        return 'Invalid email or password. Please check your credentials.';
      }
      if (errorData.error === ERROR_MESSAGES.INVALID_REFRESH_TOKEN) {
        return 'Session expired. Please log in again.';
      }
      return 'Authentication required. Please log in.';

    case API_STATUS.FORBIDDEN:
      if (errorData.error === ERROR_MESSAGES.ACCOUNT_INACTIVE) {
        return 'Your account is inactive. Please contact support.';
      }
      if (errorData.error === ERROR_MESSAGES.IP_BLOCKED) {
        return 'Access denied. Your IP address has been blocked.';
      }
      if (errorData.error === ERROR_MESSAGES.EMAIL_BLOCKED) {
        return 'Access denied. This email address has been blocked.';
      }
      return 'Access denied. Please contact support.';

    case API_STATUS.TOO_MANY_REQUESTS:
      const retryAfter = errorData.retryAfter || 900;
      const minutes = Math.ceil(retryAfter / 60);
      return `Too many attempts. Please wait ${minutes} minutes before trying again.`;

    case API_STATUS.INTERNAL_SERVER_ERROR:
      return ERROR_MESSAGES.SERVER_ERROR;

    default:
      return errorData.error || 'An unexpected error occurred. Please try again.';
  }
}

/**
 * Validates email format
 * @param email - Email string to validate
 * @returns boolean indicating if email is valid
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
}

/**
 * Validates password strength based on API requirements
 * @param password - Password string to validate
 * @returns object with validation result and error messages
 */
export function validatePassword(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long');
  }
  if (password.length > 128) {
    errors.push('Password must be less than 128 characters');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }
  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number');
  }
  if (!/[@$!%*?&]/.test(password)) {
    errors.push('Password must contain at least one special character from @$!%*?&');
  }

  // Check for common passwords
  const commonPasswords = [
    'password', '123456', '123456789', 'qwerty', 'abc123', 'password123',
    'admin', 'letmein', 'welcome', 'monkey', '1234567890', 'password1',
    'qwerty123', 'dragon', 'master', 'hello', 'freedom', 'whatever',
    'qazwsx', 'trustno1', 'jordan23', 'harley', 'password1', 'welcome123'
  ];
  
  if (commonPasswords.includes(password.toLowerCase())) {
    errors.push(`"${password}" is a common password and is blocked`);
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validates password and returns detailed requirements status
 * @param password - Password string to validate
 * @returns object with individual requirement status
 */
export function validatePasswordDetailed(password: string): {
  isValid: boolean;
  requirements: {
    minLength: boolean;
    hasUppercase: boolean;
    hasLowercase: boolean;
    hasNumber: boolean;
    hasSpecialChar: boolean;
    notCommon: boolean;
  };
} {
  const minLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecialChar = /[@$!%*?&]/.test(password);
  
  // Common passwords to block
  const commonPasswords = [
    'password', '123456', '123456789', 'qwerty', 'abc123', 'password123',
    'admin', 'letmein', 'welcome', 'monkey', '1234567890', 'password1',
    'qwerty123', 'dragon', 'master', 'hello', 'freedom', 'whatever',
    'qazwsx', 'trustno1', 'jordan23', 'harley', 'password1', 'welcome123'
  ];
  const notCommon = !commonPasswords.includes(password.toLowerCase());
  
  const isValid = minLength && hasUppercase && hasLowercase && hasNumber && hasSpecialChar && notCommon;
  
  return {
    isValid,
    requirements: {
      minLength,
      hasUppercase,
      hasLowercase,
      hasNumber,
      hasSpecialChar,
      notCommon,
    },
  };
}

/**
 * Validates mobile number format (international format)
 * @param mobile - Mobile number string to validate
 * @returns boolean indicating if mobile number is valid
 */
export function validateMobile(mobile: string): boolean {
  const mobileRegex = /^\+[1-9]\d{1,14}$/;
  return mobileRegex.test(mobile.trim());
}

/**
 * Validates Indian mobile number format (10 digits)
 * @param mobile - Mobile number string to validate (without country code)
 * @returns boolean indicating if mobile number is valid
 */
export function validateIndianMobile(mobile: string): boolean {
  const mobileRegex = /^[6-9]\d{9}$/;
  return mobileRegex.test(mobile.trim());
}
# ArchivArt Persistent Authentication System

## Overview

The ArchivArt app now includes a robust persistent authentication system that allows users to stay logged in for extended periods (30 days) with automatic token refresh.

## Features

### 🔐 **Persistent Authentication**
- **30-day session duration**: Users stay logged in for 30 days
- **Automatic token refresh**: Access tokens refresh every 15 minutes
- **Seamless experience**: No interruption to user workflow
- **Secure storage**: Tokens stored in AsyncStorage

### 🛡️ **Security Features**
- **Short-lived access tokens**: 15-minute expiration for security
- **Long-lived refresh tokens**: 30-day expiration for convenience
- **Token invalidation**: Immediate logout capability
- **Session tracking**: Monitor active sessions and device info
- **Automatic cleanup**: Expired sessions are automatically invalidated

## Implementation

### Core Components

1. **AuthService** (`services/AuthService.ts`)
   - Handles all authentication operations
   - Manages token storage and refresh
   - Provides authenticated API requests

2. **AuthContext** (`contexts/AuthContext.tsx`)
   - React context for authentication state
   - Provides auth methods to components
   - Manages user session state

3. **AuthGuard** (`components/AuthGuard.tsx`)
   - Protects routes that require authentication
   - Redirects unauthenticated users to login

### Authentication Flow

1. **Login/Register**: User provides credentials
2. **Token Storage**: Access and refresh tokens are stored securely
3. **API Requests**: All requests include authentication headers
4. **Auto Refresh**: Tokens are automatically refreshed when needed
5. **Logout**: All tokens are cleared and invalidated

### Usage Examples

#### Login
```typescript
const { login } = useAuth();

await login({
  email: 'user@example.com',
  password: 'password123'
});
```

#### Register
```typescript
const { register } = useAuth();

await register({
  name: 'John Doe',
  username: 'johndoe',
  email: 'john@example.com',
  password: 'password123',
  mobile: '+1234567890'
});
```

#### Logout
```typescript
const { logout } = useAuth();

await logout();
```

#### Protected Routes
```typescript
<AuthGuard>
  <YourProtectedComponent />
</AuthGuard>
```

## API Integration

The authentication system automatically handles:

- **Token Headers**: Adds `Authorization: Bearer <token>` to requests
- **Refresh Headers**: Adds `X-Refresh-Token: <refresh_token>` for auto-refresh
- **Token Refresh**: Automatically refreshes expired tokens
- **Error Handling**: Redirects to login on authentication failures

## Backend Requirements

Your backend should implement these endpoints:

- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/refresh` - Token refresh
- `POST /api/auth/logout` - User logout
- `GET /api/auth/profile` - Get user profile

## Security Notes

- Tokens are stored in AsyncStorage (can be upgraded to Keychain for production)
- All API requests are automatically authenticated
- Session state is managed centrally
- Automatic cleanup of expired sessions

## Testing

To test the authentication system:

1. Register a new account
2. Login with credentials
3. Use the app normally
4. Close and reopen the app (should stay logged in)
5. Test logout functionality

## Troubleshooting

### Common Issues

1. **Login fails**: Check API endpoint and credentials
2. **Token refresh fails**: Verify refresh token endpoint
3. **Session not persisting**: Check AsyncStorage permissions
4. **API requests fail**: Ensure authentication headers are included

### Debug Mode

Enable debug logging by checking the console for:
- Token storage/retrieval logs
- API request/response logs
- Authentication state changes

## Future Enhancements

- [ ] Implement Keychain storage for production
- [ ] Add biometric authentication
- [ ] Implement "Remember Me" functionality
- [ ] Add session management UI
- [ ] Implement password reset flow
- [ ] Add two-factor authentication

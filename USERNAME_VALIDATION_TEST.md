# Username Validation Test Guide

## How to Test Username Validation and Suggestions

### Test Cases:

1. **Available Username (should show green checkmark):**
   - Try: `myuniqueusername123`
   - Expected: Green checkmark with "✓ Username is available"

2. **Taken Username (should show error and suggestions):**
   - Try: `admin`, `user`, `test`, `john`, `jane`, `alex`, `mike`, `sarah`, `david`, `lisa`
   - Expected: Red error message "Username is already taken" + clickable suggestions

3. **Short Username (should show error):**
   - Try: `ab` (less than 3 characters)
   - Expected: Red error message "Username must be at least 3 characters long"

4. **Invalid Characters (should show error):**
   - Try: `user@name` or `user name`
   - Expected: Red error message "Username can only contain letters, numbers, and underscores"

### Features Implemented:

✅ **Real-time validation** - Checks as you type (after 3+ characters)
✅ **Loading indicator** - Shows "Checking username availability..." while validating
✅ **Success indicator** - Green checkmark for available usernames
✅ **Error messages** - Clear error messages for invalid/taken usernames
✅ **Smart suggestions** - Generates 5 alternative usernames when taken
✅ **Clickable suggestions** - Click any suggestion to auto-fill the username field
✅ **Mock mode** - Works offline with simulated API responses

### Mock Usernames (taken):
- admin, user, test, john, jane, alex, mike, sarah, david, lisa

### How Suggestions Work:
When a username is taken, the system generates suggestions like:
- `username123`
- `username_456`
- `username2024`
- `myusername`
- `usernameuser`

### Technical Details:
- **API Endpoint**: `/api/auth/check-username`
- **Mock Mode**: Enabled for testing (set `MOCK_MODE: true` in `constants/Api.ts`)
- **Validation Delay**: 500ms simulated API delay
- **Minimum Length**: 3 characters
- **Allowed Characters**: Letters, numbers, underscores only

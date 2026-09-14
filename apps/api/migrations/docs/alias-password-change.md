# Alias Password Change API

This document describes the new API endpoint that allows administrators to change user alias passwords.

## Overview

The alias password change functionality allows administrators (Master Admin, Site Manager, or Institution Manager) to change the `alias_password` field of a user alias. This is different from changing the main user password - it specifically targets the alias password used for student authentication.

## API Endpoint

**POST** `/users/change-alias-password`

### Authentication
- Requires valid admin authentication token
- Accessible by: Master Admin, Site Manager, Institution Manager

### Request Body

```json
{
  "userAliasId": 123,
  "newAliasPassword": "NewSecurePassword123!"
}
```

### Request Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `userAliasId` | number | Yes | The ID of the user alias whose password should be changed |
| `newAliasPassword` | string | Yes | The new password (8-20 characters, must include uppercase, lowercase, number, and special character) |

### Password Requirements

The new alias password must meet the following criteria:
- Length: 8-20 characters
- Must contain at least 1 uppercase letter (A-Z)
- Must contain at least 1 lowercase letter (a-z)
- Must contain at least 1 number (0-9)
- Must contain at least 1 special character (!@#$%^&* etc.)

### Response

**Success (200):**
```json
true
```

**Bad Request (400):**
```json
{
  "statusCode": 400,
  "message": "User alias not found"
}
```

**Unprocessable Entity (422):**
```json
{
  "statusCode": 422,
  "message": "Please enter between 8 - 20 characters and include at least 1 uppercase letter, 1 lowercase letter, 1 special character and 1 number"
}
```

## Usage Examples

### cURL Example
```bash
curl -X POST http://localhost:3000/users/change-alias-password \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userAliasId": 123,
    "newAliasPassword": "NewSecurePassword123!"
  }'
```

### JavaScript/TypeScript Example
```typescript
const response = await fetch('/users/change-alias-password', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    userAliasId: 123,
    newAliasPassword: 'NewSecurePassword123!'
  })
});

if (response.ok) {
  console.log('Alias password changed successfully');
} else {
  const error = await response.json();
  console.error('Error:', error.message);
}
```

## Security Considerations

1. **Authentication Required**: Only authenticated administrators can access this endpoint
2. **Role-Based Access**: Limited to Master Admin, Site Manager, and Institution Manager roles
3. **Password Hashing**: Passwords are hashed using bcrypt with 12 salt rounds
4. **Input Validation**: Strict password strength requirements enforced
5. **Audit Trail**: Changes are logged through the existing logging system

## Database Changes

This functionality works with the existing `user_aliases` table structure. The `alias_password` column stores the bcrypt-hashed password.

## Error Handling

The API provides clear error messages for common issues:
- Invalid user alias ID
- Password strength requirements not met
- Authentication/authorization failures

## Related Components

- **Controller**: `UsersController.changeAliasPassword()`
- **Service**: `UsersService.changeAliasPassword()`
- **DTO**: `ChangeAliasPasswordDto`
- **Entity**: `UserAlias` (specifically the `aliasPassword` field)

## Testing

To test this functionality:

1. Ensure you have admin privileges
2. Create a test user alias
3. Use the API endpoint to change the alias password
4. Verify the password was updated in the database
5. Test with invalid inputs to ensure proper error handling

## Frontend Integration

This API is designed to work with the existing "Change Password" button in the student profile modal, similar to the instructor password change functionality.

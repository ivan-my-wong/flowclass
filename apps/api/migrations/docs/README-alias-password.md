# Alias Password Migration

This document describes the migration to add the `alias_password` column to the `user_aliases` table.

## Overview

The migration adds a new `alias_password` column to the `user_aliases` table. This column stores a hashed version of the phone number from the associated user, which can be used for authentication purposes.

## Migration Details

### File: `1754019000000-AddAliasPasswordToUserAliases.ts`

**What it does:**
1. Adds the `alias_password` column as nullable initially
2. Populates existing records with SHA-256 hashes of the associated user's phone number
3. Makes the column NOT NULL after successful population
4. Includes validation to ensure all records are properly updated

**Why SHA-256:**
- Consistent hashing: The same phone number always produces the same hash
- Fast and efficient for database operations
- Suitable for deterministic password generation

## Running the Migration

### Option 1: Run the Migration Directly
```bash
npm run migration:up
```

### Option 2: Run the Migration Manually
```bash
# Generate the migration
npm run migration:generate-v2 migrations/runs/AddAliasPasswordToUserAliases

# Run the migration
npm run migration:up
```

## Alternative Approach: Bcrypt Hashing

If you prefer to use bcrypt (which generates different hashes each time due to salt), you can use the utility script instead:

### Using the Utility Script
```bash
npm run script:generateAliasPasswords
```

**What the script does:**
- Connects to the database
- Finds all user aliases without passwords
- Generates bcrypt hashes for each associated user's phone number
- Updates the database with the hashed values

**Note:** Bcrypt hashes will be different each time for the same phone number due to salt generation.

## Rollback

To rollback the migration:
```bash
npm run migration:down
```

This will remove the `alias_password` column from the `user_aliases` table.

## Verification

After running the migration, you can verify the results:

```sql
-- Check that all records have passwords
SELECT COUNT(*) FROM user_aliases WHERE alias_password IS NULL;

-- Check that passwords are properly hashed (should be 64 characters for SHA-256)
SELECT 
  COUNT(*) as total_records,
  COUNT(CASE WHEN LENGTH(alias_password) = 64 THEN 1 END) as sha256_hashes,
  COUNT(CASE WHEN LENGTH(alias_password) = 60 THEN 1 END) as bcrypt_hashes
FROM user_aliases;
```

## Security Considerations

1. **SHA-256 Approach:**
   - Deterministic: Same input always produces same output
   - Fast: Suitable for database operations
   - No salt: Consider if this meets your security requirements

2. **Bcrypt Approach:**
   - Non-deterministic: Different hash each time
   - Slower: Designed for password hashing
   - Salted: More secure for password storage

## Database Schema Changes

```sql
-- Before migration
CREATE TABLE user_aliases (
  -- existing columns...
);

-- After migration
CREATE TABLE user_aliases (
  -- existing columns...
  alias_password varchar(255) NOT NULL
);
```

## Entity Changes

The `UserAlias` entity has been updated to include:

```typescript
@Column({ name: 'alias_password', nullable: true })
aliasPassword?: string
```

## Testing

Test the migration in a development environment first:

1. Create a backup of your development database
2. Run the migration
3. Verify that all existing records have passwords
4. Test that new records can be created with passwords
5. Verify rollback functionality

## Troubleshooting

### Common Issues

1. **Migration fails with "still have null alias_password"**
   - Check if there are user aliases without associated users
   - Verify that all users have phone numbers

2. **Phone number is null**
   - The migration will skip records where the associated user has no phone number
   - Consider handling these cases separately

3. **Permission errors**
   - Ensure the database user has ALTER TABLE permissions
   - Check database connection settings

### Debug Commands

```sql
-- Check for orphaned user aliases
SELECT ua.* FROM user_aliases ua 
LEFT JOIN users u ON ua.user_id = u.id 
WHERE u.id IS NULL;

-- Check for users without phone numbers
SELECT * FROM users WHERE phone IS NULL OR phone = '';

-- Check migration status
SELECT * FROM migrations WHERE name LIKE '%AliasPassword%';
```

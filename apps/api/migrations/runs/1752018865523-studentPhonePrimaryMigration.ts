import { MigrationInterface, QueryRunner } from 'typeorm'

export class studentPhonePrimaryMigration1752018865523 implements MigrationInterface {
  name = 'studentPhonePrimaryMigration1752018865523'

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Backup existing data
    console.log('📦 Creating backup tables...')
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS users_backup AS 
      SELECT * FROM users WHERE 1=0;
    `)
    await queryRunner.query(`
      INSERT INTO users_backup SELECT * FROM users;
    `)

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS user_aliases_backup AS 
      SELECT * FROM user_aliases WHERE 1=0;
    `)
    await queryRunner.query(`
      INSERT INTO user_aliases_backup SELECT * FROM user_aliases;
    `)

    // 2. Copy phone numbers from user_aliases to users
    console.log('📱 Copying phone numbers from user_aliases to users...')

    // Get the latest phone number for each user from user_aliases (based on updated_at)
    const userPhonesFromAliases = await queryRunner.query(`
      SELECT DISTINCT ON (user_id) 
        user_id, 
        phone, 
        institution_id,
        updated_at
      FROM user_aliases 
      WHERE phone IS NOT NULL 
        AND phone != '' 
        AND TRIM(phone) != ''
      ORDER BY user_id, updated_at DESC;
    `)

    console.log(`📊 Found ${userPhonesFromAliases.length} users with phone numbers in user_aliases`)
    const updatedUserIds = new Set()
    // Update users table with phone numbers from user_aliases
    for (const aliasPhone of userPhonesFromAliases) {
      await queryRunner.query(
        `
    UPDATE users 
    SET phone = $1 
    WHERE id = $2;
  `,
        [aliasPhone.phone, aliasPhone.user_id]
      )
      updatedUserIds.add(aliasPhone.user_id)
      console.log(
        `📞 Updated user ${aliasPhone.user_id} with latest phone ${aliasPhone.phone} from user_aliases`
      )
    }

    // 3. Add student identifier configuration for institutions
    console.log('🏫 Adding student identifier configuration to institutions...')
    const institutionsTableExists = await queryRunner.hasTable('institutions')
    if (institutionsTableExists) {
      const hasStudentPrimaryIdentifier = await queryRunner.hasColumn(
        'institutions',
        'student_primary_identifier'
      )
      if (!hasStudentPrimaryIdentifier) {
        await queryRunner.query(`
            CREATE TYPE student_primary_identifier_enum AS ENUM ('email', 'phone');
          `)
        await queryRunner.query(`
          ALTER TABLE institutions
          ADD COLUMN student_primary_identifier student_primary_identifier_enum DEFAULT 'phone' 
          CHECK (student_primary_identifier IN ('email', 'phone'));
        `)
      }
    }
    // 4. Add email field to user_aliases (if needed for reference)
    console.log('👥 Adding email field to user_aliases...')
    const userAliasesTableExists = await queryRunner.hasTable('user_aliases')
    if (userAliasesTableExists) {
      const hasEmailColumn = await queryRunner.hasColumn('user_aliases', 'email')
      if (!hasEmailColumn) {
        await queryRunner.query(`
                  ALTER TABLE user_aliases 
                  ADD COLUMN email VARCHAR(255) NULL;
                `)

        // Copy the existing user's email to user_aliases
        await queryRunner.query(`
                  UPDATE user_aliases ua
                  SET email = u.email
                  FROM users u
                  WHERE ua.user_id = u.id AND u.email IS NOT NULL;
                `)
      }
    }

    // 5. Handle student users without phone numbers
    console.log('📱 Processing student phone numbers...')

    // 5.1 Find all student users without phone numbers
    const studentsWithoutPhone = await queryRunner.query(`
        SELECT DISTINCT u.id, u.email, u.first_name, u.phone
        FROM users u
        INNER JOIN user_roles ur ON ur.user_id = u.id
        LEFT JOIN user_aliases ua ON ua.user_id = u.id AND ua.phone IS NOT NULL AND ua.phone != '' AND TRIM(ua.phone) != ''
        WHERE ur.is_student = true 
        AND (u.phone IS NULL OR u.phone = '' OR TRIM(u.phone) = '')
        AND ua.user_id IS NULL 
      `)

    console.log(`📊 Found ${studentsWithoutPhone.length} students without phone numbers`)

    // 5.2 Generate temporary phone numbers for students without phones
    if (studentsWithoutPhone.length > 0) {
      let tempPhoneCounter = 10000000 // Starting from 852 10000000

      for (const student of studentsWithoutPhone) {
        let tempPhone = ''
        let phoneExists = true

        // Ensure the generated phone numbers are unique
        while (phoneExists) {
          tempPhone = `852${tempPhoneCounter}`
          const existingPhone = await queryRunner.query(
            `
                    SELECT id FROM users WHERE phone = $1;
                  `,
            [tempPhone]
          )

          if (existingPhone.length === 0) {
            phoneExists = false
          } else {
            tempPhoneCounter++
          }
        }

        await queryRunner.query(
          `
                  UPDATE users 
                  SET phone = $1 
                  WHERE id = $2;
                `,
          [tempPhone, student.id]
        )

        // console.log(
        //   `📞 Generated phone ${tempPhone} for student ${student.first_name} (${student.email})`
        // )
        tempPhoneCounter++
      }
    }

    // 6. Handle duplicate phone numbers (across all users)
    // First handle empty strings
    const emptyPhoneUsersQuery =
      updatedUserIds.size > 0
        ? `SELECT id, email, first_name FROM users WHERE (phone = '' OR phone IS NULL) AND id NOT IN (${Array.from(
            updatedUserIds
          ).join(',')})`
        : `SELECT id, email, first_name FROM users WHERE phone = '' OR phone IS NULL`

    const emptyPhoneUsers = await queryRunner.query(emptyPhoneUsersQuery)

    if (emptyPhoneUsers.length > 0) {
      console.log(`🔧 Found ${emptyPhoneUsers.length} users with empty phone numbers`)

      let tempPhoneCounter = 20000000 // Starting from +852 20000000 for empty phones

      for (const user of emptyPhoneUsers) {
        let tempPhone = ''
        let phoneExists = true

        while (phoneExists) {
          tempPhone = `852${tempPhoneCounter}`
          const existingPhone = await queryRunner.query(`SELECT id FROM users WHERE phone = $1;`, [
            tempPhone,
          ])

          if (existingPhone.length === 0) {
            phoneExists = false
          } else {
            tempPhoneCounter++
          }
        }

        await queryRunner.query(`UPDATE users SET phone = $1 WHERE id = $2;`, [tempPhone, user.id])

        console.log(`📞 Assigned phone ${tempPhone} to user ${user.first_name} (${user.email})`)
        tempPhoneCounter++
      }
    }
    console.log('🔍 Checking for duplicate phone numbers...')
    const duplicatePhones = await queryRunner.query(`
              SELECT phone, COUNT(*) as count, array_agg(id) as user_ids
              FROM users
              WHERE phone IS NOT NULL AND phone != ''
              GROUP BY phone
              HAVING COUNT(*) > 1;
            `)

    if (duplicatePhones.length > 0) {
      console.log(`⚠️  Found ${duplicatePhones.length} duplicate phone numbers`)

      for (const dup of duplicatePhones) {
        console.log(`🔧 Fixing duplicate phone: ${dup.phone}`)
        const userIds = dup.user_ids
        const fromAliasUsers = userIds.filter((id: any) => updatedUserIds.has(parseInt(id)))
        if (fromAliasUsers.length > 0) {
          const keepUserId = fromAliasUsers[0]
          const reassignUsers = userIds.filter((id: any) => id !== keepUserId)

          console.log(`📞 Keeping phone ${dup.phone} for user ${keepUserId} (from user_aliases)`)

          for (const userId of reassignUsers) {
            let newPhoneCounter = 10000000 + parseInt(userId)
            let newPhone = ''
            let phoneExists = true

            while (phoneExists) {
              newPhone = `852${newPhoneCounter}`
              const existingPhone = await queryRunner.query(
                `SELECT id FROM users WHERE phone = $1;`,
                [newPhone]
              )

              if (existingPhone.length === 0) {
                phoneExists = false
              } else {
                newPhoneCounter++
              }
            }

            await queryRunner.query(`UPDATE users SET phone = $1 WHERE id = $2;`, [
              newPhone,
              userId,
            ])

            const userInfo = await queryRunner.query(
              `SELECT email, first_name FROM users WHERE id = $1;`,
              [userId]
            )

            console.log(
              `📞 Changed user ${userInfo[0]?.first_name} (${userInfo[0]?.email}) phone to ${newPhone}`
            )
          }
        } else {
          for (let i = 1; i < userIds.length; i++) {
            const userId = userIds[i]
            let newPhoneCounter = 10000000 + parseInt(userId)
            let newPhone = ''
            let phoneExists = true

            while (phoneExists) {
              newPhone = `852${newPhoneCounter}`
              const existingPhone = await queryRunner.query(
                `
                      SELECT id FROM users WHERE phone = $1;
                    `,
                [newPhone]
              )

              if (existingPhone.length === 0) {
                phoneExists = false
              } else {
                newPhoneCounter++
              }
            }

            await queryRunner.query(
              `
                    UPDATE users SET phone = $1 WHERE id = $2;
                  `,
              [newPhone, userId]
            )

            const userInfo = await queryRunner.query(
              `
                    SELECT email, first_name FROM users WHERE id = $1;
                  `,
              [userId]
            )

            console.log(
              `📞 Changed user ${userInfo[0]?.first_name} (${userInfo[0]?.email}) phone to ${newPhone}`
            )
          }
        }
      }
    }

    // 7. Drop phone column from user_aliases table
    console.log('🗑️ Dropping phone column from user_aliases...')
    if (userAliasesTableExists) {
      const hasPhoneColumn = await queryRunner.hasColumn('user_aliases', 'phone')
      if (hasPhoneColumn) {
        await queryRunner.query(`
                  ALTER TABLE user_aliases 
                  DROP COLUMN phone;
                `)
        console.log('✅ Dropped phone column from user_aliases')
      }
    }

    // 8. Create necessary indexes
    console.log('📊 Creating necessary indexes...')

    // Phone index (if not existing)
    const phoneIndexExists = await queryRunner.query(`
              SELECT indexname FROM pg_indexes 
              WHERE tablename = 'users' AND indexname = 'IX_users_phone';
            `)

    if (phoneIndexExists.length === 0) {
      await queryRunner.query(`
                CREATE UNIQUE INDEX IX_users_phone ON users (phone);
              `)
      console.log('✅ Created unique IX_users_phone index')
    }

    // 10. Verify data integrity
    console.log('🔍 Validating data integrity...')

    const studentsWithoutPhoneAfter = await queryRunner.query(`
              SELECT COUNT(*) as count
              FROM users u
              INNER JOIN user_roles ur ON ur.user_id = u.id
              WHERE ur.is_student = true 
              AND (u.phone IS NULL OR u.phone = '' OR TRIM(u.phone) = '');
            `)

    if (studentsWithoutPhoneAfter[0].count > 0) {
      throw new Error(
        `❌ Migration failed: ${studentsWithoutPhoneAfter[0].count} students still without phone`
      )
    }

    const duplicatePhonesAfter = await queryRunner.query(`
              SELECT COUNT(*) as count
              FROM (
                SELECT phone
                FROM users
                WHERE phone IS NOT NULL AND phone != ''
                GROUP BY phone
                HAVING COUNT(*) > 1
              ) as dups;
            `)

    if (duplicatePhonesAfter[0].count > 0) {
      throw new Error(
        `❌ Migration failed: Still have ${duplicatePhonesAfter[0].count} duplicate phones`
      )
    }

    // 11. Statistical Report
    const totalStudents = await queryRunner.query(`
              SELECT COUNT(DISTINCT u.id) as count
              FROM users u
              INNER JOIN user_roles ur ON ur.user_id = u.id
              WHERE ur.is_student = true;
            `)

    const totalUsers = await queryRunner.query(`
              SELECT COUNT(*) as count FROM users;
            `)

    const phonesCopiedFromAliases = userPhonesFromAliases.length

    console.log(`📊 Migration Summary:`)
    console.log(`   - Total users: ${totalUsers[0].count}`)
    console.log(`   - Total students: ${totalStudents[0].count}`)
    console.log(`   - Phones copied from user_aliases: ${phonesCopiedFromAliases}`)
    console.log(`   - Students processed for temporary phones: ${studentsWithoutPhone.length}`)
    console.log(`   - Duplicate phones resolved: ${duplicatePhones.length}`)
    console.log(`   - Phone column dropped from user_aliases: ✅`)
    // 9. Apply database constraints
    console.log('🔧 Applying database constraints...')

    // Set phone as required
    await queryRunner.query(`
                  ALTER TABLE users 
                  ALTER COLUMN phone SET NOT NULL;
                `)

    console.log('✅ Database constraints updated - phone is now required for all users')
    console.log('✅ Student Phone Primary Migration completed successfully!')
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    console.log('🔄 Rolling back Student Phone Primary Migration...')

    // 1. Remove the new fields from institutions
    console.log('🏫 Removing institution configuration fields...')
    const institutionsTableExists = await queryRunner.hasTable('institutions')
    if (institutionsTableExists) {
      const hasStudentPrimaryIdentifier = await queryRunner.hasColumn(
        'institutions',
        'student_primary_identifier'
      )
      if (hasStudentPrimaryIdentifier) {
        await queryRunner.query(`
          ALTER TABLE institutions
          DROP COLUMN student_primary_identifier;
        `)
        await queryRunner.query(`
            DROP TYPE IF EXISTS student_primary_identifier_enum;
          `)
      }
    }

    // 2. Restore phone column to user_aliases
    console.log('📱 Restoring phone column to user_aliases...')
    const userAliasesTableExists = await queryRunner.hasTable('user_aliases')
    if (userAliasesTableExists) {
      const hasPhoneColumn = await queryRunner.hasColumn('user_aliases', 'phone')
      if (!hasPhoneColumn) {
        await queryRunner.query(`
          ALTER TABLE user_aliases 
          ADD COLUMN phone VARCHAR(255) NULL;
        `)

        // Restore phone data from backup if available
        const backupTableExists = await queryRunner.hasTable('user_aliases_backup')
        if (backupTableExists) {
          await queryRunner.query(`
            UPDATE user_aliases ua
            SET phone = uab.phone
            FROM user_aliases_backup uab
            WHERE ua.id = uab.id AND uab.phone IS NOT NULL;
          `)
          console.log('✅ Restored phone data to user_aliases from backup')
        }
      }
    }

    // 3. Remove the email field from user_aliases
    console.log('👥 Removing email field from user_aliases...')
    if (userAliasesTableExists) {
      const hasEmailColumn = await queryRunner.hasColumn('user_aliases', 'email')
      if (hasEmailColumn) {
        await queryRunner.query(`
          ALTER TABLE user_aliases 
          DROP COLUMN email;
        `)
      }
    }

    // 4. Remove unique constraint from phone index
    console.log('📊 Removing unique phone index...')
    await queryRunner.query(`
			  ALTER TABLE users 
			  ALTER COLUMN phone DROP NOT NULL;
			`)
    const phoneIndexExists = await queryRunner.query(`
      SELECT indexname FROM pg_indexes 
      WHERE tablename = 'users' AND indexname = 'IX_users_phone';
    `)

    if (phoneIndexExists.length > 0) {
      await queryRunner.query(`
        DROP INDEX IX_users_phone;
      `)
      console.log('✅ Removed IX_users_phone index')
    }

    // 5. Warning about user phone data
    console.log(
      '⚠️  WARNING: User phone data will NOT be automatically reverted to avoid data loss'
    )
    console.log('⚠️  Please manually restore from users_backup table if needed')
    console.log(
      '⚠️  To restore: UPDATE users SET phone = users_backup.phone FROM users_backup WHERE users.id = users_backup.id;'
    )

    console.log('✅ Student Phone Primary Migration rollback completed!')
  }
}

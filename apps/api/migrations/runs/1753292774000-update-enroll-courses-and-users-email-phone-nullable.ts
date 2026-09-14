import { MigrationInterface, QueryRunner } from 'typeorm'

export class UpdateEnrollCoursesAndUsersEmailPhoneNullable1753292774000
  implements MigrationInterface {
  name = 'UpdateEnrollCoursesAndUsersEmailPhoneNullable1753292774000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Backup enroll_courses
    console.log('📦 Creating enroll_courses_backup table...')
    await queryRunner.query(`
  DO $$
  BEGIN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_name = 'enroll_courses_backup'
    ) THEN
      CREATE TABLE enroll_courses_backup AS TABLE enroll_courses;
    END IF;
  END$$;
`)
    await queryRunner.query(`INSERT INTO enroll_courses_backup SELECT * FROM enroll_courses;`)
    // 2. Fill empty phone numbers in enroll_courses with unique numbers starting from 85210000000
    console.log('📱 Filling empty phone numbers in enroll_courses...')
    let tempPhoneCounter = 10000000 // 85210000000
    // Get all enroll_courses with empty or null phone
    const enrollsWithoutPhone = await queryRunner.query(
      `SELECT id FROM enroll_courses WHERE phone IS NULL OR phone = '' OR TRIM(phone) = ''`
    )
    for (const enroll of enrollsWithoutPhone) {
      let tempPhone = ''
      let phoneExists = true
      while (phoneExists) {
        tempPhone = `852${tempPhoneCounter}`
        const existing = await queryRunner.query(`SELECT id FROM enroll_courses WHERE phone = $1`, [
          tempPhone,
        ])
        if (existing.length === 0) {
          phoneExists = false
        } else {
          tempPhoneCounter++
        }
      }
      await queryRunner.query(`UPDATE enroll_courses SET phone = $1 WHERE id = $2`, [
        tempPhone,
        enroll.id,
      ])
      tempPhoneCounter++
    }
    // 3. Make email nullable and phone non-nullable in enroll_courses
    await queryRunner.query(`ALTER TABLE "enroll_courses" ALTER COLUMN "email" DROP NOT NULL`)
    await queryRunner.query(`ALTER TABLE "enroll_courses" ALTER COLUMN "phone" SET NOT NULL`)
    // 4. Make email nullable and phone non-nullable in users
    await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "email" DROP NOT NULL`)
    await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "phone" SET NOT NULL`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // 1. Revert email to NOT NULL and phone to nullable in enroll_courses
    await queryRunner.query(`ALTER TABLE "enroll_courses" ALTER COLUMN "email" SET NOT NULL`)
    await queryRunner.query(`ALTER TABLE "enroll_courses" ALTER COLUMN "phone" DROP NOT NULL`)
    // 2. Revert email to NOT NULL and phone to nullable in users
    await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "email" SET NOT NULL`)
    await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "phone" DROP NOT NULL`)
    // 3. Optionally restore enroll_courses from backup (manual step)
    console.log('⚠️  To restore enroll_courses, copy data from enroll_courses_backup if needed.')
  }
}

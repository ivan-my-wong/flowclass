import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddStudentRatesToInstructorProfile1756019006241 implements MigrationInterface {
  name = 'AddStudentRatesToInstructorProfile1756019006241'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE "instructor_profiles" 
        ADD "is_student_rates_enabled" boolean NOT NULL DEFAULT false
      `)

    await queryRunner.query(`
        ALTER TABLE "instructor_profiles" 
        ADD "student_rates_config" jsonb
      `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "instructor_profiles" DROP COLUMN "student_rates_config"`)
    await queryRunner.query(
      `ALTER TABLE "instructor_profiles" DROP COLUMN "is_student_rates_enabled"`
    )
  }
}

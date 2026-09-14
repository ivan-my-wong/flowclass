import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddStudentNotificationSettings1729493013417 implements MigrationInterface {
  name = 'AddStudentNotificationSettings1729493013417'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "student_memo" ADD "overdue_reminder" jsonb DEFAULT '{}'`)
    await queryRunner.query(`ALTER TABLE "student_memo" ADD "lesson_reminder" jsonb DEFAULT '{}'`)
    await queryRunner.query(`ALTER TABLE "student_memo" ADD "payment_reminder" jsonb DEFAULT '{}'`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "student_memo" DROP COLUMN "payment_reminder"`)
    await queryRunner.query(`ALTER TABLE "student_memo" DROP COLUMN "lesson_reminder"`)
    await queryRunner.query(`ALTER TABLE "student_memo" DROP COLUMN "overdue_reminder"`)
  }
}

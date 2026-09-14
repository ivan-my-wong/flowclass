import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddEnumToNotificationRecord1733564171241 implements MigrationInterface {
  name = 'AddEnumToNotificationRecord1733564171241'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "public"."notification_record_notification_type_enum" RENAME TO "notification_record_notification_type_enum_old"`
    )
    await queryRunner.query(
      `CREATE TYPE "public"."notification_record_notification_type_enum" AS ENUM('CONFIRM_PAYMENT', 'REJECT_PAYMENT', 'REMINDER', 'APPLICATION', 'FORGET_PASSWORD', 'INVITATION', 'LESSON_POSTPONE', 'ASSIGN_COURSE', 'OTHERS', 'WAITING_FOR_PAYMENT', 'ENROLLED_IN_COURSE', 'RECEIVED_COUPON', 'UPDATE_ON_COURSE_STATUS', 'APPLIED_FOR_COURSE', 'STUDENT_REGISTERED', 'STUDENT_PAID')`
    )
    await queryRunner.query(
      `ALTER TABLE "notification_record" ALTER COLUMN "notification_type" DROP DEFAULT`
    )
    await queryRunner.query(
      `ALTER TABLE "notification_record" ALTER COLUMN "notification_type" TYPE "public"."notification_record_notification_type_enum" USING "notification_type"::"text"::"public"."notification_record_notification_type_enum"`
    )
    await queryRunner.query(
      `ALTER TABLE "notification_record" ALTER COLUMN "notification_type" SET DEFAULT 'OTHERS'`
    )
    await queryRunner.query(`DROP TYPE "public"."notification_record_notification_type_enum_old"`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."notification_record_notification_type_enum_old" AS ENUM('APPLICATION', 'ASSIGN_COURSE', 'CONFIRM_PAYMENT', 'FORGET_PASSWORD', 'INVITATION', 'LESSON_POSTPONE', 'OTHERS', 'REJECT_PAYMENT', 'REMINDER')`
    )
    await queryRunner.query(
      `ALTER TABLE "notification_record" ALTER COLUMN "notification_type" DROP DEFAULT`
    )
    await queryRunner.query(
      `ALTER TABLE "notification_record" ALTER COLUMN "notification_type" TYPE "public"."notification_record_notification_type_enum_old" USING "notification_type"::"text"::"public"."notification_record_notification_type_enum_old"`
    )
    await queryRunner.query(
      `ALTER TABLE "notification_record" ALTER COLUMN "notification_type" SET DEFAULT 'OTHERS'`
    )
    await queryRunner.query(`DROP TYPE "public"."notification_record_notification_type_enum"`)
    await queryRunner.query(
      `ALTER TYPE "public"."notification_record_notification_type_enum_old" RENAME TO "notification_record_notification_type_enum"`
    )
  }
}

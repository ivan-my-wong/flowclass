import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddAdditionalSettingsColumnAtStudentNotifSetting1750038903657
  implements MigrationInterface
{
  name = 'AddAdditionalSettingsColumnAtStudentNotifSetting1750038903657'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "student_notification_setting" ADD "additional_settings" jsonb NOT NULL DEFAULT '{}'`
    )
    await queryRunner.query(
      `ALTER TYPE "public"."notification_record_notification_type_enum" RENAME TO "notification_record_notification_type_enum_old"`
    )
    await queryRunner.query(
      `CREATE TYPE "public"."notification_record_notification_type_enum" AS ENUM('CONFIRM_PAYMENT', 'REJECT_PAYMENT', 'REMINDER', 'APPLICATION', 'FORGET_PASSWORD', 'INVITATION', 'LESSON_POSTPONE', 'ASSIGN_COURSE', 'OTHERS', 'WAITING_FOR_PAYMENT', 'ENROLLED_IN_COURSE', 'RECEIVED_COUPON', 'UPDATE_ON_COURSE_STATUS', 'APPLIED_FOR_COURSE', 'STUDENT_REGISTERED', 'STUDENT_PAID', 'STUDENT_QUESTION', 'STUDENT_ANSWER', 'REQUEST_TIME_CHANGE_APPROVED', 'REQUEST_TIME_CHANGE_REJECTED', 'REQUEST_TIME_CHANGE_PENDING', 'APPLICATION_EMAIL_VERIFICATION', 'admin_notif_after_enrollment_submitted', 'student_notif_after_enrollment_submitted', 'student_notif_after_payment_approved', 'student_notif_after_payment_rejected', 'student_notif_after_add_new_class', 'admin_notif_after_add_new_class', 'student_notif_after_add_new_lesson', 'student_notif_after_change_lesson_date', 'student_notif_payment_reminder', 'student_lesson_reminder', 'create_invoice')`
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
      `ALTER TABLE "courses" ALTER COLUMN "require_email_verification" DROP NOT NULL`
    )
    await queryRunner.query(
      `CREATE TYPE "public"."notification_record_notification_type_enum_old" AS ENUM('CONFIRM_PAYMENT', 'REJECT_PAYMENT', 'REMINDER', 'APPLICATION', 'FORGET_PASSWORD', 'INVITATION', 'LESSON_POSTPONE', 'ASSIGN_COURSE', 'OTHERS', 'WAITING_FOR_PAYMENT', 'ENROLLED_IN_COURSE', 'RECEIVED_COUPON', 'UPDATE_ON_COURSE_STATUS', 'APPLIED_FOR_COURSE', 'STUDENT_REGISTERED', 'STUDENT_PAID', 'STUDENT_QUESTION', 'STUDENT_ANSWER', 'REQUEST_TIME_CHANGE_APPROVED', 'REQUEST_TIME_CHANGE_REJECTED', 'REQUEST_TIME_CHANGE_PENDING', 'admin_notif_after_enrollment_submitted', 'student_notif_after_enrollment_submitted', 'student_notif_after_payment_approved', 'student_notif_after_payment_rejected', 'student_notif_after_add_new_class', 'admin_notif_after_add_new_class', 'student_notif_after_add_new_lesson', 'student_notif_after_change_lesson_date', 'student_notif_payment_reminder', 'student_lesson_reminder', 'create_invoice')`
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
    await queryRunner.query(
      `ALTER TABLE "student_notification_setting" DROP COLUMN "additional_settings"`
    )
  }
}

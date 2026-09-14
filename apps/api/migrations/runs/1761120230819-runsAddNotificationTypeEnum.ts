import { MigrationInterface, QueryRunner } from 'typeorm'

export class Runs1761120230819 implements MigrationInterface {
  name = 'Runs1761120230819'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "public"."notification_record_notification_type_enum" RENAME TO "notification_record_notification_type_enum_old"`
    )
    await queryRunner.query(
      `CREATE TYPE "public"."notification_record_notification_type_enum" AS ENUM('CONFIRM_PAYMENT', 'REJECT_PAYMENT', 'REMINDER', 'APPLICATION', 'FORGET_PASSWORD', 'INVITATION', 'LESSON_POSTPONE', 'ASSIGN_COURSE', 'OTHERS', 'WAITING_FOR_PAYMENT', 'ENROLLED_IN_COURSE', 'RECEIVED_COUPON', 'UPDATE_ON_COURSE_STATUS', 'APPLIED_FOR_COURSE', 'STUDENT_REGISTERED', 'STUDENT_PAID', 'STUDENT_QUESTION', 'STUDENT_ANSWER', 'REQUEST_TIME_CHANGE_APPROVED', 'REQUEST_TIME_CHANGE_REJECTED', 'REQUEST_TIME_CHANGE_PENDING', 'APPLICATION_EMAIL_VERIFICATION', 'TEACHER_FEEDBACK', 'admin_notif_after_enrollment_submitted', 'student_notif_after_enrollment_submitted', 'student_notif_after_payment_approved', 'student_notif_after_payment_rejected', 'student_notif_after_add_new_class', 'admin_notif_after_add_new_class', 'student_notif_after_add_new_lesson', 'student_notif_after_change_lesson_date', 'student_notif_payment_reminder', 'student_lesson_reminder', 'create_invoice')`
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
      `CREATE TYPE "public"."notification_record_notification_type_enum_old" AS ENUM('APPLICATION', 'APPLICATION_EMAIL_VERIFICATION', 'APPLIED_FOR_COURSE', 'ASSIGN_COURSE', 'CONFIRM_PAYMENT', 'ENROLLED_IN_COURSE', 'FORGET_PASSWORD', 'INVITATION', 'LESSON_POSTPONE', 'OTHERS', 'RECEIVED_COUPON', 'REJECT_PAYMENT', 'REMINDER', 'REQUEST_TIME_CHANGE_APPROVED', 'REQUEST_TIME_CHANGE_PENDING', 'REQUEST_TIME_CHANGE_REJECTED', 'STUDENT_ANSWER', 'STUDENT_PAID', 'STUDENT_QUESTION', 'STUDENT_REGISTERED', 'UPDATE_ON_COURSE_STATUS', 'WAITING_FOR_PAYMENT', 'admin_notif_after_add_new_class', 'admin_notif_after_enrollment_submitted', 'create_invoice', 'student_lesson_reminder', 'student_notif_after_add_new_class', 'student_notif_after_add_new_lesson', 'student_notif_after_change_lesson_date', 'student_notif_after_enrollment_submitted', 'student_notif_after_payment_approved', 'student_notif_after_payment_rejected', 'student_notif_payment_reminder')`
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

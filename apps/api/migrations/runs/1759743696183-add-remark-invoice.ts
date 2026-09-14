import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddRemarkInvoice1759743696183 implements MigrationInterface {
  name = 'AddRemarkInvoice1759743696183'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "invoices" ADD "remark" text`)
    await queryRunner.query(
      `ALTER TYPE "public"."record_logs_type_enum" RENAME TO "record_logs_type_enum_old"`
    )
    await queryRunner.query(
      `CREATE TYPE "public"."record_logs_type_enum" AS ENUM('ASSIGN_COUPON_FOR_STUDENT', 'CREATE_COUPON', 'USAGE_COUPON', 'CONFIRM_USAGE_COUPON', 'DELETE_COUPON', 'INACTIVE_COUPON', 'STUDENT_CHANGE_INFOMATION', 'STUDENT_ADD_CLASS', 'STUDENT_CHANGE_TIME_TABLE', 'ADDING_CLASS', 'RESCHEDULE_LESSON', 'UPDATE_PAYMENT_AMOUNT', 'UPDATE_INVOICE_REMARK', 'DELETE_INVOICE_REMARK')`
    )
    await queryRunner.query(
      `ALTER TABLE "record_logs" ALTER COLUMN "type" TYPE "public"."record_logs_type_enum" USING "type"::"text"::"public"."record_logs_type_enum"`
    )
    await queryRunner.query(`DROP TYPE "public"."record_logs_type_enum_old"`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."record_logs_type_enum_old" AS ENUM('ASSIGN_COUPON_FOR_STUDENT', 'CREATE_COUPON', 'USAGE_COUPON', 'CONFIRM_USAGE_COUPON', 'DELETE_COUPON', 'INACTIVE_COUPON', 'STUDENT_CHANGE_INFOMATION', 'STUDENT_ADD_CLASS', 'STUDENT_CHANGE_TIME_TABLE', 'ADDING_CLASS', 'RESCHEDULE_LESSON', 'UPDATE_PAYMENT_AMOUNT')`
    )
    await queryRunner.query(
      `ALTER TABLE "record_logs" ALTER COLUMN "type" TYPE "public"."record_logs_type_enum_old" USING "type"::"text"::"public"."record_logs_type_enum_old"`
    )
    await queryRunner.query(`DROP TYPE "public"."record_logs_type_enum"`)
    await queryRunner.query(
      `ALTER TYPE "public"."record_logs_type_enum_old" RENAME TO "record_logs_type_enum"`
    )
    await queryRunner.query(`ALTER TABLE "invoices" DROP COLUMN "remark"`)
  }
}

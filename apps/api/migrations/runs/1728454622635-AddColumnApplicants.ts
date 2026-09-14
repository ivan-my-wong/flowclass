import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddColumnApplicants1728454622635 implements MigrationInterface {
  name = 'AddColumnApplicants1728454622635'

  public async up(queryRunner: QueryRunner): Promise<void> {
    // await queryRunner.query(`DROP INDEX "public"."IX_user_roles_"`)
    await queryRunner.query(
      `ALTER TABLE "classes" ADD "set_multiple_applicant" boolean DEFAULT false`
    )
    await queryRunner.query(
      `ALTER TABLE "invoices" ADD "num_of_applicant" integer NOT NULL DEFAULT '1'`
    )
    await queryRunner.query(`ALTER TABLE "invoices" ADD "applicants" jsonb NOT NULL DEFAULT '[]'`)

    await queryRunner.query(
      `ALTER TABLE "student_form" ALTER COLUMN "field_id" TYPE character varying USING "field_id"::character varying, ALTER COLUMN "field_id" SET DEFAULT NULL`
    )
    await queryRunner.query(
      `ALTER TYPE "public"."record_logs_type_enum" RENAME TO "record_logs_type_enum_old"`
    )
    await queryRunner.query(
      `CREATE TYPE "public"."record_logs_type_enum" AS ENUM('ASSIGN_COUPON_FOR_STUDENT', 'CREATE_COUPON', 'USAGE_COUPON', 'CONFIRM_USAGE_COUPON', 'DELETE_COUPON', 'INACTIVE_COUPON', 'STUDENT_CHANGE_INFOMATION', 'STUDENT_ADD_CLASS', 'STUDENT_CHANGE_TIME_TABLE', 'ADDING_CLASS', 'RESCHEDULE_LESSON')`
    )
    await queryRunner.query(
      `ALTER TABLE "record_logs" ALTER COLUMN "type" TYPE "public"."record_logs_type_enum" USING "type"::"text"::"public"."record_logs_type_enum"`
    )
    await queryRunner.query(`DROP TYPE "public"."record_logs_type_enum_old"`)
    // await queryRunner.query(`CREATE INDEX "IX_user_roles_site_id" ON "user_roles" ("site_id") `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IX_user_roles_site_id"`)
    await queryRunner.query(
      `CREATE TYPE "public"."record_logs_type_enum_old" AS ENUM('ASSIGN_COUPON_FOR_STUDENT', 'CREATE_COUPON', 'USAGE_COUPON', 'DELETE_COUPON', 'INACTIVE_COUPON', 'STUDENT_CHANGE_INFOMATION', 'STUDENT_ADD_CLASS', 'STUDENT_CHANGE_TIME_TABLE', 'ADDING_CLASS', 'RESCHEDULE_LESSON')`
    )
    await queryRunner.query(
      `ALTER TABLE "record_logs" ALTER COLUMN "type" TYPE "public"."record_logs_type_enum_old" USING "type"::"text"::"public"."record_logs_type_enum_old"`
    )
    await queryRunner.query(`DROP TYPE "public"."record_logs_type_enum"`)
    await queryRunner.query(
      `ALTER TYPE "public"."record_logs_type_enum_old" RENAME TO "record_logs_type_enum"`
    )
    await queryRunner.query(`ALTER TABLE "student_form" DROP COLUMN "field_id"`)
    await queryRunner.query(`ALTER TABLE "student_form" ADD "field_id" integer NOT NULL`)
    await queryRunner.query(`ALTER TABLE "period_lessons" DROP COLUMN "end_time"`)
    await queryRunner.query(`ALTER TABLE "period_lessons" ADD "end_time" character varying`)
    await queryRunner.query(`ALTER TABLE "period_lessons" DROP COLUMN "start_time"`)
    await queryRunner.query(`ALTER TABLE "period_lessons" ADD "start_time" character varying`)
    await queryRunner.query(`ALTER TABLE "invoices" DROP COLUMN "applicants"`)
    await queryRunner.query(`ALTER TABLE "invoices" DROP COLUMN "num_of_applicant"`)
    await queryRunner.query(`ALTER TABLE "classes" DROP COLUMN "set_multiple_applicant"`)
    await queryRunner.query(`CREATE INDEX "IX_user_roles_" ON "user_roles" ("site_id") `)
  }
}

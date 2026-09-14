import { MigrationInterface, QueryRunner } from 'typeorm'

export class BeforeOctober271729998452990 implements MigrationInterface {
  name = 'BeforeOctober271729998452990'

  public async up(queryRunner: QueryRunner): Promise<void> {
    // await queryRunner.query(
    //   `ALTER TABLE "whatsapp_template" DROP CONSTRAINT "FK_784ca1c4bfddebfd1b465a48e37"`
    // )
    // await queryRunner.query(
    //   `ALTER TABLE "automation_flow" DROP CONSTRAINT "FK_d18652305594ca243b6b0557c57"`
    // )
    // await queryRunner.query(
    //   `CREATE TYPE "public"."prerequisites_condition_operator_enum" AS ENUM('AND', 'OR')`
    // )
    // await queryRunner.query(
    //   `ALTER TABLE "whatsapp_template" DROP CONSTRAINT "UQ_784ca1c4bfddebfd1b465a48e37"`
    // )
    // await queryRunner.query(`ALTER TABLE "whatsapp_template" DROP COLUMN "assigned_to_id"`)
    // await queryRunner.query(`ALTER TABLE "whatsapp_template" ADD "assigned_to" jsonb DEFAULT '{}'`)
    // await queryRunner.query(
    //   `ALTER TABLE "automation_flow_steps" ADD "automation_interval" character varying`
    // )
    // await queryRunner.query(
    //   `ALTER TABLE "automation_flow_steps" ADD "interval_label" character varying`
    // )
    // await queryRunner.query(`ALTER TABLE "whatsapp_template" ALTER COLUMN "name" DROP NOT NULL`)
    // await queryRunner.query(`ALTER TABLE "whatsapp_template" ALTER COLUMN "name" SET DEFAULT ''`)
    // await queryRunner.query(`ALTER TABLE "automation_flow" ALTER COLUMN "name" DROP NOT NULL`)
    // await queryRunner.query(`ALTER TABLE "automation_flow" ALTER COLUMN "name" SET DEFAULT ''`)
    // await queryRunner.query(
    //   `ALTER TABLE "automation_flow_steps" ALTER COLUMN "email_template_id" DROP NOT NULL`
    // )
    // await queryRunner.query(
    //   `ALTER TABLE "automation_flow_steps" ALTER COLUMN "twillio_content_id" DROP NOT NULL`
    // )
    // await queryRunner.query(
    //   `ALTER TABLE "automation_flow_steps" DROP COLUMN "automation_function_id"`
    // )
    // await queryRunner.query(
    //   `ALTER TABLE "automation_flow_steps" ADD "automation_function" jsonb DEFAULT '{}'`
    // )
    // await queryRunner.query(`DROP TYPE "public"."AttendanceStatus"`)
    // await queryRunner.query(
    //   `ALTER TABLE "student_lesson" ADD "attendance" character varying NOT NULL DEFAULT 'PENDING'`
    // )
    // await queryRunner.query(`ALTER TABLE "courses" ALTER COLUMN "prerequisites" DROP DEFAULT`)
    // await queryRunner.query(`ALTER TABLE "student_form" ALTER COLUMN "field_id" DROP NOT NULL`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "student_form" ALTER COLUMN "field_id" SET NOT NULL`)
    await queryRunner.query(`ALTER TABLE "courses" ALTER COLUMN "prerequisites" SET DEFAULT '{}'`)
    await queryRunner.query(`ALTER TABLE "classes" DROP COLUMN "type"`)
    await queryRunner.query(
      `CREATE TYPE "public"."class_type_enum" AS ENUM('regular', 'workshop', 'appointment', 'recurring', 'subscription')`
    )
    await queryRunner.query(`ALTER TABLE "classes" ADD "type" "public"."class_type_enum"`)
    await queryRunner.query(`ALTER TABLE "student_lesson" DROP COLUMN "attendance"`)
    await queryRunner.query(
      `CREATE TYPE "public"."AttendanceStatus" AS ENUM('ATTENDED', 'NOT_ATTENDED', 'PENDING', 'CANCELLED', 'POSTPONE')`
    )
    await queryRunner.query(
      `ALTER TABLE "student_lesson" ADD "attendance" "public"."AttendanceStatus" NOT NULL DEFAULT 'PENDING'`
    )
    await queryRunner.query(
      `ALTER TABLE "automation_flow_steps" DROP COLUMN "automation_function_id"`
    )
    await queryRunner.query(
      `ALTER TABLE "automation_flow_steps" ADD "automation_function_id" integer`
    )
    await queryRunner.query(
      `ALTER TABLE "automation_flow_steps" ALTER COLUMN "twillio_content_id" SET NOT NULL`
    )
    await queryRunner.query(
      `ALTER TABLE "automation_flow_steps" ALTER COLUMN "email_template_id" SET NOT NULL`
    )
    await queryRunner.query(`ALTER TABLE "automation_flow" ALTER COLUMN "name" DROP DEFAULT`)
    await queryRunner.query(`ALTER TABLE "automation_flow" ALTER COLUMN "name" SET NOT NULL`)
    await queryRunner.query(`ALTER TABLE "whatsapp_template" ALTER COLUMN "name" DROP DEFAULT`)
    await queryRunner.query(`ALTER TABLE "whatsapp_template" ALTER COLUMN "name" SET NOT NULL`)
    await queryRunner.query(`ALTER TABLE "automation_flow_steps" DROP COLUMN "interval_label"`)
    await queryRunner.query(`ALTER TABLE "automation_flow_steps" DROP COLUMN "automation_interval"`)
    await queryRunner.query(`ALTER TABLE "whatsapp_template" DROP COLUMN "assigned_to"`)
    await queryRunner.query(`ALTER TABLE "whatsapp_template" ADD "assigned_to_id" integer`)
    await queryRunner.query(
      `ALTER TABLE "whatsapp_template" ADD CONSTRAINT "UQ_784ca1c4bfddebfd1b465a48e37" UNIQUE ("assigned_to_id")`
    )
    await queryRunner.query(`DROP TABLE "prerequisites_application"`)
    await queryRunner.query(`DROP TABLE "prerequisites_condition_group"`)
    await queryRunner.query(`DROP TABLE "prerequisites_condition"`)
    await queryRunner.query(`DROP TYPE "public"."prerequisites_condition_operator_enum"`)
    await queryRunner.query(
      `ALTER TABLE "automation_flow" ADD CONSTRAINT "FK_d18652305594ca243b6b0557c57" FOREIGN KEY ("id") REFERENCES "institution_automation_flow"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "whatsapp_template" ADD CONSTRAINT "FK_784ca1c4bfddebfd1b465a48e37" FOREIGN KEY ("assigned_to_id") REFERENCES "automation_function"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
  }
}

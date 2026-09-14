import { MigrationInterface, QueryRunner } from 'typeorm'

export class CreateLinkForAutomationStepAndClass1728465721910 implements MigrationInterface {
  name = 'CreateLinkForAutomationStepAndClass1728465721910'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "automation_step_class" ("automation_step_id" integer NOT NULL, "course_id" integer NOT NULL, CONSTRAINT "PK_d22057ba36583d016cf9ef56884" PRIMARY KEY ("automation_step_id", "course_id"))`
    )
    await queryRunner.query(
      `CREATE INDEX "IDX_a4d72170ca0d946b243ddc584b" ON "automation_step_class" ("automation_step_id") `
    )
    await queryRunner.query(
      `CREATE INDEX "IDX_3717b6e5cb24aacb85093e1cfc" ON "automation_step_class" ("course_id") `
    )
    await queryRunner.query(
      `ALTER TABLE "automation_flow" ALTER COLUMN "cron_job_id" DROP NOT NULL`
    )
    await queryRunner.query(
      `ALTER TABLE "whatsapp_template" ALTER COLUMN "category" SET DEFAULT 'Utility'`
    )
    await queryRunner.query(`ALTER TABLE "student_form" ALTER COLUMN "field_id" SET DEFAULT NULL`)
    await queryRunner.query(
      `ALTER TABLE "automation_step_class" ADD CONSTRAINT "FK_a4d72170ca0d946b243ddc584b2" FOREIGN KEY ("automation_step_id") REFERENCES "automation_flow_steps"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "automation_step_class" ADD CONSTRAINT "FK_3717b6e5cb24aacb85093e1cfc2" FOREIGN KEY ("course_id") REFERENCES "classes"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "automation_step_class" DROP CONSTRAINT "FK_3717b6e5cb24aacb85093e1cfc2"`
    )
    await queryRunner.query(
      `ALTER TABLE "automation_step_class" DROP CONSTRAINT "FK_a4d72170ca0d946b243ddc584b2"`
    )
    await queryRunner.query(`ALTER TABLE "student_form" ALTER COLUMN "field_id" DROP NOT NULL`)
    await queryRunner.query(
      `ALTER TABLE "whatsapp_template" ALTER COLUMN "category" SET DEFAULT 'UTILITY'`
    )
    await queryRunner.query(`ALTER TABLE "automation_flow" ALTER COLUMN "cron_job_id" SET NOT NULL`)
    await queryRunner.query(`DROP INDEX "public"."IDX_3717b6e5cb24aacb85093e1cfc"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_a4d72170ca0d946b243ddc584b"`)
    await queryRunner.query(`DROP TABLE "automation_step_class"`)
  }
}

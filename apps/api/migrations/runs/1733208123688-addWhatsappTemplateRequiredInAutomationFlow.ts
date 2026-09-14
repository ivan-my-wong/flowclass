import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddWhatsappTemplateRequiredInAutomationFlow1733208123688
  implements MigrationInterface
{
  name = 'AddWhatsappTemplateRequiredInAutomationFlow1733208123688'

  public async up(queryRunner: QueryRunner): Promise<void> {
    // await queryRunner.query(`DROP INDEX "public"."ix_whatsapp_template_institution_id"`)
    await queryRunner.query(
      `ALTER TABLE "automation_flow_steps" ADD "whatsappTemplateRequired" boolean NOT NULL DEFAULT false`
    )
    await queryRunner.query(
      `ALTER TABLE "whatsapp_template" ALTER COLUMN "category" SET DEFAULT 'Utility'`
    )
    await queryRunner.query(
      `ALTER TABLE "automation_flow" ALTER COLUMN "cron_job_id" DROP NOT NULL`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "automation_flow" ALTER COLUMN "cron_job_id" SET NOT NULL`)
    await queryRunner.query(
      `ALTER TABLE "whatsapp_template" ALTER COLUMN "category" SET DEFAULT 'UTILITY'`
    )
    await queryRunner.query(
      `ALTER TABLE "automation_flow_steps" DROP COLUMN "whatsappTemplateRequired"`
    )
    await queryRunner.query(
      `CREATE INDEX "ix_whatsapp_template_institution_id" ON "whatsapp_template" ("institution_id") `
    )
  }
}

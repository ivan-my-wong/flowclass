import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddWhatsappTemplatesStage21727590070893 implements MigrationInterface {
  name = 'AddWhatsappTemplatesStage21727590070893'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "institution_automation_flow" DROP COLUMN "updated_by"`)
    await queryRunner.query(`ALTER TABLE "institution_automation_flow" ADD "updated_by" integer`)
    await queryRunner.query(`ALTER TABLE "automation_flow" ALTER COLUMN "created_at" SET NOT NULL`)
    await queryRunner.query(`ALTER TABLE "automation_flow" ALTER COLUMN "updated_at" SET NOT NULL`)
    await queryRunner.query(`ALTER TABLE "automation_flow" DROP COLUMN "updated_by"`)
    await queryRunner.query(`ALTER TABLE "automation_flow" ADD "updated_by" integer`)
    await queryRunner.query(`ALTER TABLE "automation_flow" ALTER COLUMN "cron_job_id" SET NOT NULL`)
    await queryRunner.query(
      `ALTER TABLE "automation_flow_steps" ALTER COLUMN "created_at" SET NOT NULL`
    )
    await queryRunner.query(
      `ALTER TABLE "automation_flow_steps" ALTER COLUMN "updated_at" SET NOT NULL`
    )
    await queryRunner.query(
      `ALTER TABLE "whatsapp_template" ALTER COLUMN "category" SET DEFAULT 'UTILITY'`
    )
    await queryRunner.query(
      `ALTER TABLE "whatsapp_template" ALTER COLUMN "twilio_content_id" DROP DEFAULT`
    )
    await queryRunner.query(
      `ALTER TABLE "whatsapp_template" ALTER COLUMN "content_type" SET NOT NULL`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "automation_function" DROP CONSTRAINT "FK_045e1842fe760f84aa1c419084a"`
    )
    await queryRunner.query(
      `ALTER TABLE "automation_function" DROP CONSTRAINT "FK_045e1842fe760f84aa1c419084a"`
    )
    await queryRunner.query(
      `ALTER TABLE "whatsapp_template" ALTER COLUMN "content_type" DROP NOT NULL`
    )
    await queryRunner.query(
      `ALTER TABLE "whatsapp_template" ALTER COLUMN "twilio_content_id" SET DEFAULT NULL`
    )
    await queryRunner.query(
      `ALTER TABLE "whatsapp_template" ALTER COLUMN "category" SET DEFAULT 'Utility'`
    )
    await queryRunner.query(
      `ALTER TABLE "automation_flow_steps" ALTER COLUMN "updated_at" DROP NOT NULL`
    )
    await queryRunner.query(
      `ALTER TABLE "automation_flow_steps" ALTER COLUMN "created_at" DROP NOT NULL`
    )
    await queryRunner.query(
      `ALTER TABLE "automation_flow" ALTER COLUMN "cron_job_id" DROP NOT NULL`
    )
    await queryRunner.query(`ALTER TABLE "automation_flow" DROP COLUMN "updated_by"`)
    await queryRunner.query(`ALTER TABLE "automation_flow" ADD "updated_by" character varying`)
    await queryRunner.query(`ALTER TABLE "automation_flow" ALTER COLUMN "updated_at" DROP NOT NULL`)
    await queryRunner.query(`ALTER TABLE "automation_flow" ALTER COLUMN "created_at" DROP NOT NULL`)
    await queryRunner.query(`ALTER TABLE "institution_automation_flow" DROP COLUMN "updated_by"`)
    await queryRunner.query(`ALTER TABLE "institution_automation_flow" ADD "updated_by" bigint`)
  }
}

import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddEnableLessonReminder1754972868963 implements MigrationInterface {
  name = 'AddEnableLessonReminder1754972868963'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "automation_settings" ADD "settings" jsonb NOT NULL DEFAULT '{}'`
    )
    await queryRunner.query(`
      UPDATE "automation_settings" 
      SET "settings" = jsonb_build_object(
      'enableInvoiceGeneration', COALESCE("enable_invoice_generation", false),
      'sendWhatsappAfterGenerateInvoice', COALESCE("send_whatsapp_after_generate_invoice", false),
      'enableLessonReminder', false
      )
      WHERE "settings" = '{}'::jsonb
      `)

    await queryRunner.query(
      `ALTER TABLE "automation_settings" DROP COLUMN IF EXISTS "enable_invoice_generation"`
    )
    await queryRunner.query(
      `ALTER TABLE "automation_settings" DROP COLUMN IF EXISTS "send_whatsapp_after_generate_invoice"`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "automation_settings" DROP COLUMN "settings"`)
    await queryRunner.query(
      `ALTER TABLE "automation_settings" ADD "enable_invoice_generation" boolean DEFAULT false`
    )
    await queryRunner.query(
      `ALTER TABLE "automation_settings" ADD "send_whatsapp_after_generate_invoice" boolean DEFAULT false`
    )
  }
}

import { MigrationInterface, QueryRunner } from 'typeorm'

export class RunsDocumentCampaignMediaType1755334627106 implements MigrationInterface {
  name = 'RunsDocumentCampaignMediaType1755334627106'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "document_campaign_recipients" ADD "channel" character varying`
    )
    await queryRunner.query(`ALTER TABLE "document_campaign_recipients" ADD "invoice_id" integer`)

    await queryRunner.query(
      `CREATE INDEX "IX_document_campaign_recipients_invoice_id" ON "document_campaign_recipients" ("invoice_id") `
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IX_document_campaign_recipients_invoice_id"`)
    await queryRunner.query(`ALTER TABLE "document_campaign_recipients" DROP COLUMN "channel"`)
    await queryRunner.query(`ALTER TABLE "document_campaign_recipients" DROP COLUMN "invoice_id"`)
  }
}

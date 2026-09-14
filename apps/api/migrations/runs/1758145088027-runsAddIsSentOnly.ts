import { MigrationInterface, QueryRunner } from 'typeorm'

export class RunsAddIsSentOnly1758145088027 implements MigrationInterface {
  name = 'RunsAddIsSentOnly1758145088027'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "document_campaign" ADD "is_sent_only" boolean NOT NULL DEFAULT false`
    )
    // DROP TABLE invoice_installments as it is not used anymore
    await queryRunner.query(`DROP TABLE IF EXISTS "invoice_installments"`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "document_campaign" DROP COLUMN "is_sent_only"`)
  }
}

import { MigrationInterface, QueryRunner } from 'typeorm'

export class RunsAddInvoicePdfUrl1757561908933 implements MigrationInterface {
  name = 'RunsAddInvoicePdfUrl1757561908933'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "invoices" ADD "pdf_url" text`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "invoices" DROP COLUMN "pdf_url"`)
  }
}

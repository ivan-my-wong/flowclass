import { MigrationInterface, QueryRunner } from "typeorm";

export class AddDiscountDetailsToInvoiceTable1754018751584 implements MigrationInterface {
  name = 'AddDiscountDetailsToInvoiceTable1754018751584'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "invoices"
      ADD COLUMN "discount_details" jsonb -- Stores array of InvoiceDiscountDetail objects with bundle discount information
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "invoices"
      DROP COLUMN "discount_details"
    `)
  }

}

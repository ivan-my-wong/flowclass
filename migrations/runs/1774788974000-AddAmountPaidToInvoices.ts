import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddAmountPaidToInvoices1774788974000 implements MigrationInterface {
  name = 'AddAmountPaidToInvoices1774788974000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "invoices" ADD "amount_paid" numeric NOT NULL DEFAULT 0`
    )
    await queryRunner.query(
      `UPDATE "invoices" SET "amount_paid" = "pay_amount"`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "invoices" DROP COLUMN "amount_paid"`
    )
  }
}

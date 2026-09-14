import { MigrationInterface, QueryRunner } from 'typeorm'

export class DropXeroIntegrationTablesAndColumns1783307000000 implements MigrationInterface {
  name = 'DropXeroIntegrationTablesAndColumns1783307000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "integration_xero" CASCADE`)
    await queryRunner.query(`DROP TABLE IF EXISTS "xero_contact" CASCADE`)
    await queryRunner.query(`ALTER TABLE "classes" DROP COLUMN IF EXISTS "xero_item_id"`)
    await queryRunner.query(`ALTER TABLE "invoices" DROP COLUMN IF EXISTS "xero_invoice_id"`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "classes" ADD COLUMN IF NOT EXISTS "xero_item_id" character varying`)
    await queryRunner.query(`ALTER TABLE "invoices" ADD COLUMN IF NOT EXISTS "xero_invoice_id" character varying`)
  }
}

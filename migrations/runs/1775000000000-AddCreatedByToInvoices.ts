import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddCreatedByToInvoices1775000000000 implements MigrationInterface {
  name = 'AddCreatedByToInvoices1775000000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "invoices"
      ADD COLUMN IF NOT EXISTS "created_by" bigint NULL
    `)
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IX_invoices_created_by"
      ON "invoices" ("created_by")
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "IX_invoices_created_by"`)
    await queryRunner.query(`ALTER TABLE "invoices" DROP COLUMN IF EXISTS "created_by"`)
  }
}

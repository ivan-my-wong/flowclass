import { MigrationInterface, QueryRunner } from 'typeorm'

export class Runs1755247579431 implements MigrationInterface {
  name = 'Runs1755247579431'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "invoices" ADD "used_balance" numeric NOT NULL DEFAULT '0'`
    )
    await queryRunner.query(`ALTER TABLE "invoices" ADD "credit_transactions_id" integer`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "invoices" DROP COLUMN "credit_transactions_id"`)
    await queryRunner.query(`ALTER TABLE "invoices" DROP COLUMN "used_balance"`)
  }
}

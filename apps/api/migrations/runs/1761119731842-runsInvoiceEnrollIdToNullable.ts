import { MigrationInterface, QueryRunner } from 'typeorm'

export class RunsMigrateEnrollIdToNullable1761119731842 implements MigrationInterface {
  name = 'RunsMigrateEnrollIdToNullable1761119731842'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE public.invoices ALTER COLUMN enroll_id DROP NOT NULL;`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE public.invoices ALTER COLUMN enroll_id SET NOT NULL;`)
  }
}

import { MigrationInterface, QueryRunner } from 'typeorm'

export class RunsAddEnrollIdsAndCourseIdsToInvoiceTable1759450938221 implements MigrationInterface {
  name = 'RunsAddEnrollIdsAndCourseIdsToInvoiceTable1759450938221'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "invoices" ADD "enroll_ids" jsonb`)
    await queryRunner.query(`ALTER TABLE "invoices" ADD "course_ids" jsonb`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "invoices" DROP COLUMN "course_ids"`)
    await queryRunner.query(`ALTER TABLE "invoices" DROP COLUMN "enroll_ids"`)
  }
}

import { MigrationInterface, QueryRunner } from 'typeorm'

export class RemoveDatesFromPackageDiscounts1774939283000 implements MigrationInterface {
  name = 'RemoveDatesFromPackageDiscounts1774939283000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "package_discounts" DROP COLUMN IF EXISTS "start_date"`
    )
    await queryRunner.query(
      `ALTER TABLE "package_discounts" DROP COLUMN IF EXISTS "end_date"`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "package_discounts" ADD "start_date" timestamp`
    )
    await queryRunner.query(
      `ALTER TABLE "package_discounts" ADD "end_date" timestamp`
    )
  }
}

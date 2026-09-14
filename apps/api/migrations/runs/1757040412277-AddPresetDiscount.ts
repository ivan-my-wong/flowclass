import { MigrationInterface, QueryRunner } from 'typeorm'

export class RunsAddPresetDiscount1757040412277 implements MigrationInterface {
  name = 'RunsAddPresetDiscount1757040412277'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "subscription_plan_records" ADD "preset_discount" integer NOT NULL DEFAULT '0'`
    )
    await queryRunner.query(
      `ALTER TABLE "subscription_plan_records" ADD "preset_coupon_id" varchar`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "subscription_plan_records" DROP COLUMN "preset_discount"`)
    await queryRunner.query(
      `ALTER TABLE "subscription_plan_records" DROP COLUMN "preset_coupon_id"`
    )
  }
}

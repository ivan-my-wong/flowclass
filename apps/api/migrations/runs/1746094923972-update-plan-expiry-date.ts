import { MigrationInterface, QueryRunner } from 'typeorm'

export class UpdatePlanExpiryDate1746094923972 implements MigrationInterface {
  name = 'UpdatePlanExpiryDate1746094923972'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IX_institutions_plan_id"`)

    // Add new column
    await queryRunner.query(
      `ALTER TABLE "institutions" ADD "plan_expiry_date" TIMESTAMP WITH TIME ZONE`
    )

    // Backfill null class_id with a safe fallback value
    await queryRunner.query(`
    UPDATE "appointment"
    SET "class_id" = 1 -- ⚠️ Replace 1 with a valid class_id in your system
    WHERE "class_id" IS NULL
  `)

    // Now set NOT NULL constraint
    await queryRunner.query(`ALTER TABLE "appointment" ALTER COLUMN "class_id" SET NOT NULL`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "appointment" ALTER COLUMN "class_id" DROP NOT NULL`)
    await queryRunner.query(`ALTER TABLE "institutions" DROP COLUMN "plan_expiry_date"`)
    await queryRunner.query(
      `ALTER TABLE "integration_calendar" ADD "calendar_refresh_token" character varying`
    )
    await queryRunner.query(
      `ALTER TABLE "integration_calendar" ADD "calendar_access_token" character varying`
    )
    await queryRunner.query(`CREATE INDEX "IX_institutions_plan_id" ON "institutions" ("plan_id") `)
  }
}

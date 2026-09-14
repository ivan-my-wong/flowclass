import { MigrationInterface, QueryRunner } from 'typeorm'

export class ChangedColumnNameAvailabilty1745474683973 implements MigrationInterface {
  name = 'ChangedColumnNameAvailabilty1745474683973'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IX_online_meeting_connects_institution_id"`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IX_integration_online_meeting_institution_id"`)
    await queryRunner.query(
      `ALTER TABLE "integration_online_meeting" DROP COLUMN "api_key_expires_at"`
    )
    await queryRunner.query(
      `ALTER TABLE "integration_online_meeting" ADD "api_key_expires_at" TIMESTAMP`
    )
    await queryRunner.query(
      `ALTER TABLE "availabilities" RENAME COLUMN "integration_calendar_id" TO "calendar_connect_id"`
    )
    await queryRunner.query(
      `CREATE INDEX "IX_online_meeting_connects_institution_id" ON "integration_online_meeting" ("institution_id") `
    )
  }
}

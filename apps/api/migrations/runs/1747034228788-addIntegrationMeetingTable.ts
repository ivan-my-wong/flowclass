import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddIntegrationMeetingTable1747034228788 implements MigrationInterface {
  name = 'AddIntegrationMeetingTable1747034228788'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "custom_message" ALTER COLUMN "email_notification" SET NOT NULL`
    )
    await queryRunner.query(
      `ALTER TABLE "custom_message" ALTER COLUMN "email_notification" SET DEFAULT true`
    )
    await queryRunner.query(
      `ALTER TABLE "custom_message" ALTER COLUMN "whatsapp_notification" SET NOT NULL`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IX_integration_online_meeting_institution_id"`)
    await queryRunner.query(
      `ALTER TABLE "custom_message" ALTER COLUMN "whatsapp_notification" DROP NOT NULL`
    )
    await queryRunner.query(
      `ALTER TABLE "custom_message" ALTER COLUMN "email_notification" SET DEFAULT false`
    )
    await queryRunner.query(
      `ALTER TABLE "custom_message" ALTER COLUMN "email_notification" DROP NOT NULL`
    )
    await queryRunner.query(
      `ALTER TABLE "integration_online_meeting" DROP COLUMN "api_key_expires_at"`
    )
    await queryRunner.query(`ALTER TABLE "integration_online_meeting" DROP COLUMN "account_email"`)
    await queryRunner.query(`ALTER TABLE "integration_calendar" DROP COLUMN "calendar_id"`)
    await queryRunner.query(`ALTER TABLE "integration_calendar" DROP COLUMN "api_key_expires_at"`)
    await queryRunner.query(`ALTER TABLE "integration_calendar" DROP COLUMN "calendar_email"`)
    await queryRunner.query(
      `ALTER TABLE "integration_online_meeting" ADD "refresh_token" character varying`
    )
    await queryRunner.query(
      `ALTER TABLE "integration_online_meeting" ADD "access_token" character varying`
    )
    await queryRunner.query(
      `ALTER TABLE "integration_calendar" ADD "calendar_refresh_token" character varying`
    )
    await queryRunner.query(
      `ALTER TABLE "integration_calendar" ADD "calendar_access_token" character varying`
    )
    await queryRunner.query(
      `ALTER TABLE "availabilities" RENAME COLUMN "integration_calendar_id" TO "calendar_connect_id"`
    )
  }
}

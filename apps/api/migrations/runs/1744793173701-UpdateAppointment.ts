import { MigrationInterface, QueryRunner } from 'typeorm'

export class UpdateAppointment1744793173701 implements MigrationInterface {
  name = 'UpdateAppointment1744793173701'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "appointment" ADD "duration_minutes" integer`)
    await queryRunner.query(
      `ALTER TABLE "appointment" ADD "gap_between_appointments_minutes" integer`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "appointment" DROP COLUMN "gap_between_appointments_minutes"`
    )
    await queryRunner.query(`ALTER TABLE "appointment" DROP COLUMN "duration_minutes"`)
    await queryRunner.query(
      `ALTER TABLE "calendar_connects" ADD "calendar_user_id" character varying`
    )
  }
}

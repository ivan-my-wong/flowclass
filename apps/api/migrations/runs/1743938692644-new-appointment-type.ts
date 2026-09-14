import { MigrationInterface, QueryRunner } from 'typeorm'

export class NewAppointmentType1743938692644 implements MigrationInterface {
  name = 'NewAppointmentType1743938692644'

  public async up(queryRunner: QueryRunner): Promise<void> {
    // await queryRunner.query(`DROP INDEX "public"."IX_availability_course_id"`)
    await queryRunner.query(`DROP INDEX "public"."IX_appointment_site_id"`)
    // await queryRunner.query(`ALTER TABLE "availabilities" DROP COLUMN "course_id"`)
    await queryRunner.query(`ALTER TABLE "appointment" DROP COLUMN "site_id"`)
    await queryRunner.query(`ALTER TABLE "appointment" DROP COLUMN "course_id"`)
    await queryRunner.query(`ALTER TABLE "appointment" DROP COLUMN "buffer_before"`)
    await queryRunner.query(`ALTER TABLE "appointment" DROP COLUMN "buffer_after"`)
    await queryRunner.query(`ALTER TABLE "appointment" DROP COLUMN "calendar_connect_id"`)
    await queryRunner.query(`ALTER TABLE "appointment" ADD "buffer_before_minutes" integer`)
    await queryRunner.query(`ALTER TABLE "appointment" ADD "buffer_after_minutes" integer`)
    await queryRunner.query(`ALTER TABLE "classes" ADD "appointment_id" integer`)
    await queryRunner.query(
      `ALTER TABLE "availabilities" ALTER COLUMN "available_schedules" SET NOT NULL`
    )
    await queryRunner.query(
      `ALTER TABLE "availabilities" ALTER COLUMN "available_schedules" SET DEFAULT '[]'`
    )
    await queryRunner.query(
      `ALTER TABLE "availabilities" ALTER COLUMN "date_overrides" SET NOT NULL`
    )
    await queryRunner.query(
      `ALTER TABLE "availabilities" ALTER COLUMN "date_overrides" SET DEFAULT '[]'`
    )
    // await queryRunner.query(`ALTER TABLE "appointment" ALTER COLUMN "class_id" SET NOT NULL`)
    await queryRunner.query(
      `ALTER TABLE "appointment" ALTER COLUMN "booking_condition" DROP NOT NULL`
    )
    await queryRunner.query(
      `ALTER TABLE "appointment" ALTER COLUMN "booking_condition" DROP DEFAULT`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IX_availability_institution_id"`)
    await queryRunner.query(
      `ALTER TABLE "appointment" ALTER COLUMN "booking_condition" SET DEFAULT '{}'`
    )
    await queryRunner.query(
      `ALTER TABLE "appointment" ALTER COLUMN "booking_condition" SET NOT NULL`
    )
    await queryRunner.query(`ALTER TABLE "appointment" ALTER COLUMN "class_id" DROP NOT NULL`)
    await queryRunner.query(
      `ALTER TABLE "availabilities" ALTER COLUMN "date_overrides" DROP DEFAULT`
    )
    await queryRunner.query(
      `ALTER TABLE "availabilities" ALTER COLUMN "date_overrides" DROP NOT NULL`
    )
    await queryRunner.query(
      `ALTER TABLE "availabilities" ALTER COLUMN "available_schedules" DROP DEFAULT`
    )
    await queryRunner.query(
      `ALTER TABLE "availabilities" ALTER COLUMN "available_schedules" DROP NOT NULL`
    )
    await queryRunner.query(`ALTER TABLE "classes" DROP COLUMN "appointment_id"`)
    await queryRunner.query(`ALTER TABLE "appointment" DROP COLUMN "buffer_after_minutes"`)
    await queryRunner.query(`ALTER TABLE "appointment" DROP COLUMN "buffer_before_minutes"`)
    await queryRunner.query(`ALTER TABLE "appointment" ADD "calendar_connect_id" integer`)
    await queryRunner.query(`ALTER TABLE "appointment" ADD "buffer_after" integer`)
    await queryRunner.query(`ALTER TABLE "appointment" ADD "buffer_before" integer`)
    await queryRunner.query(`ALTER TABLE "appointment" ADD "course_id" integer NOT NULL`)
    await queryRunner.query(`ALTER TABLE "appointment" ADD "site_id" integer NOT NULL`)
    await queryRunner.query(`ALTER TABLE "availabilities" ADD "course_id" integer NOT NULL`)
    await queryRunner.query(`CREATE INDEX "IX_appointment_site_id" ON "appointment" ("site_id") `)
    await queryRunner.query(
      `CREATE INDEX "IX_availability_course_id" ON "availabilities" ("course_id") `
    )
  }
}

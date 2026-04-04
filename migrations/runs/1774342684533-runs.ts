import { MigrationInterface, QueryRunner } from "typeorm";

export class Runs1774342684533 implements MigrationInterface {
    name = 'Runs1774342684533'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "student_lesson" ADD "remarks" text`);
        await queryRunner.query(`CREATE TYPE "public"."class_lessons_lesson_type_enum" AS ENUM('zoom', 'video', 'live')`);
        await queryRunner.query(`ALTER TABLE "class_lessons" ADD "lesson_type" "public"."class_lessons_lesson_type_enum" DEFAULT 'live'`);
        await queryRunner.query(`ALTER TABLE "class_regular_schedules" ALTER COLUMN "period_repeat_format" SET DEFAULT '{"every":1,"unit":"months","startTime":"2026-02-28T15:00:00.000Z"}'`);
        await queryRunner.query(`ALTER TABLE "student_lesson" ALTER COLUMN "expiry_date" SET DEFAULT NOW() + INTERVAL '30 days'`);
        await queryRunner.query(`ALTER TABLE "courses" ALTER COLUMN "email_settings" SET DEFAULT '{}'::jsonb`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "courses" ALTER COLUMN "email_settings" SET DEFAULT '{}'`);
        await queryRunner.query(`ALTER TABLE "student_lesson" ALTER COLUMN "expiry_date" SET DEFAULT (now() + '30 days')`);
        await queryRunner.query(`ALTER TABLE "class_regular_schedules" ALTER COLUMN "period_repeat_format" SET DEFAULT '{"unit": "months", "every": 1, "startTime": "2026-01-31T16:00:00.000Z"}'`);
        await queryRunner.query(`ALTER TABLE "class_lessons" DROP COLUMN "lesson_type"`);
        await queryRunner.query(`DROP TYPE "public"."class_lessons_lesson_type_enum"`);
        await queryRunner.query(`ALTER TABLE "student_lesson" DROP COLUMN "remarks"`);
    }

}

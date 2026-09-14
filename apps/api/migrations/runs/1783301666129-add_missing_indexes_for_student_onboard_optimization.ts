import { MigrationInterface, QueryRunner } from "typeorm";

export class AddMissingIndexesForStudentOnboardOptimization1783301666129 implements MigrationInterface {
    name = 'AddMissingIndexesForStudentOnboardOptimization1783301666129'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create indexes to optimize the heavy student onboard queries
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IX_enroll_courses_user_alias_id" ON "enroll_courses" ("user_alias_id")`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IX_student_form_user_alias_id" ON "student_form" ("user_alias_id")`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IX_user_aliases_institution_id" ON "user_aliases" ("institution_id")`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IX_student_lesson_student_schedule_id" ON "student_lesson" ("student_schedule_id")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop the created indexes
        await queryRunner.query(`DROP INDEX IF EXISTS "public"."IX_student_lesson_student_schedule_id"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "public"."IX_user_aliases_institution_id"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "public"."IX_student_form_user_alias_id"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "public"."IX_enroll_courses_user_alias_id"`);
    }
}

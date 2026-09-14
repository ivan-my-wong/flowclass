import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateCourseClassesTable1758723597771 implements MigrationInterface {
    name = 'UpdateCourseClassesTable1758723597771'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "courses" ADD COLUMN "course_code" character varying NULL`
        );

        await queryRunner.query(
            `ALTER TABLE "classes" ADD COLUMN "classes_code" character varying NULL`
        );

        await queryRunner.query(
            `CREATE UNIQUE INDEX "UQ_courses_course_code_institution" ON "courses" ("course_code", "institution_id") WHERE "course_code" IS NOT NULL`
        );

        await queryRunner.query(
            `CREATE UNIQUE INDEX "UQ_classes_classes_code_institution" ON "classes" ("classes_code", "institution_id") WHERE "classes_code" IS NOT NULL`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `DROP INDEX IF EXISTS "UQ_classes_classes_code_institution"`
        );
        await queryRunner.query(
            `DROP INDEX IF EXISTS "UQ_courses_course_code_institution"`
        );

        await queryRunner.query(
            `ALTER TABLE "classes" DROP COLUMN "classes_code"`
        );
        await queryRunner.query(
            `ALTER TABLE "courses" DROP COLUMN "course_code"`
        );
    }

}

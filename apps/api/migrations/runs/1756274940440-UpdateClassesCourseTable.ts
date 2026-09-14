import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateClassesCourse1756274940440 implements MigrationInterface {
    name = 'UpdateClassesCourse1756274940440'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `ALTER TABLE "classes" ADD COLUMN IF NOT EXISTS "is_archived" boolean NOT NULL DEFAULT false`
        );
        await queryRunner.query(
            `ALTER TABLE "classes" ADD COLUMN IF NOT EXISTS "archived_at" timestamptz NULL`
        );
        await queryRunner.query(
            `ALTER TABLE "courses" ADD COLUMN IF NOT EXISTS "is_archived" boolean NOT NULL DEFAULT false`
        );
        await queryRunner.query(
            `CREATE INDEX IF NOT EXISTS "IX_classes_is_archived" ON "classes" ("is_archived")`
        );
        await queryRunner.query(
            `CREATE INDEX IF NOT EXISTS "IX_courses_is_archived" ON "courses" ("is_archived")`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX IF EXISTS "IX_courses_is_archived"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "IX_classes_is_archived"`);
        await queryRunner.query(`ALTER TABLE "courses" DROP COLUMN IF EXISTS "is_archived"`);
        await queryRunner.query(`ALTER TABLE "classes" DROP COLUMN IF EXISTS "archived_at"`);
        await queryRunner.query(`ALTER TABLE "classes" DROP COLUMN IF EXISTS "is_archived"`);
    }
}
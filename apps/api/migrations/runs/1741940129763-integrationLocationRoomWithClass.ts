import { MigrationInterface, QueryRunner } from "typeorm";

export class IntegrationLocationRoomWithClass1741940129763 implements MigrationInterface {
    name = 'IntegrationLocationRoomWithClass1741940129763'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "class_lessons" ADD "location_id" integer`);
        await queryRunner.query(`ALTER TABLE "classes" ADD "location_id" integer`);
        await queryRunner.query(`CREATE INDEX "IX_class_lessons_location_id" ON "class_lessons" ("location_id") `);
        await queryRunner.query(`CREATE INDEX "IX_classes_location_id" ON "classes" ("location_id") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IX_classes_location_id"`);
        await queryRunner.query(`DROP INDEX "public"."IX_class_lessons_location_id"`);
        await queryRunner.query(`ALTER TABLE "classes" DROP COLUMN "location_id"`);
        await queryRunner.query(`ALTER TABLE "class_lessons" DROP COLUMN "location_id"`);
    }

}

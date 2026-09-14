import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddInstructorIdColumn1742529458998 implements MigrationInterface {
  name = 'AddInstructorIdColumn1742529458998'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "classes" ADD "instructor_id" integer`)
    await queryRunner.query(
      `ALTER TABLE "location_room" ALTER COLUMN "locationGroups" SET DEFAULT '[]'`
    )
    await queryRunner.query(`ALTER TABLE "location_room" ALTER COLUMN "equipment" SET DEFAULT '[]'`)
    await queryRunner.query(`ALTER TABLE "class_lessons" ADD "instructor_id" integer`)
    await queryRunner.query(
      `CREATE INDEX "IX_class_lessons_instructor_id" ON "class_lessons" ("instructor_id") `
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IX_class_lessons_instructor_id"`)
    await queryRunner.query(`DROP INDEX "public"."IX_classes_instructor_id"`)
    await queryRunner.query(`DROP INDEX "public"."IX_location_room_site_id"`)
    await queryRunner.query(`DROP INDEX "public"."IX_location_room_institution_id"`)
    await queryRunner.query(`ALTER TABLE "location_room" ALTER COLUMN "equipment" DROP DEFAULT`)
    await queryRunner.query(
      `ALTER TABLE "location_room" ALTER COLUMN "locationGroups" DROP DEFAULT`
    )
    await queryRunner.query(`ALTER TABLE "classes" DROP COLUMN "instructor_id"`)
    await queryRunner.query(`ALTER TABLE "class_lessons" DROP COLUMN "instructor_id"`)
  }
}

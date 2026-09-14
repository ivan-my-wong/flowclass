import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddNameAndPhoneInviteMember1742390916215 implements MigrationInterface {
  name = 'AddNameAndPhoneInviteMember1742390916215'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IX_class_lessons_location_id"`)
    await queryRunner.query(`DROP INDEX "public"."IX_classes_location_id"`)
    await queryRunner.query(`ALTER TABLE "class_lessons" DROP COLUMN "location_id"`)
    await queryRunner.query(`ALTER TABLE "classes" DROP COLUMN "location_id"`)
    await queryRunner.query(`ALTER TABLE "invite_site_members" ADD "name" character varying`)
    await queryRunner.query(`ALTER TABLE "invite_site_members" ADD "phone" character varying`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "invite_site_members" DROP COLUMN "phone"`)
    await queryRunner.query(`ALTER TABLE "invite_site_members" DROP COLUMN "name"`)
    await queryRunner.query(`ALTER TABLE "classes" ADD "location_id" integer`)
    await queryRunner.query(`ALTER TABLE "class_lessons" ADD "location_id" integer`)
    await queryRunner.query(`CREATE INDEX "IX_classes_location_id" ON "classes" ("location_id") `)
    await queryRunner.query(
      `CREATE INDEX "IX_class_lessons_location_id" ON "class_lessons" ("location_id") `
    )
  }
}

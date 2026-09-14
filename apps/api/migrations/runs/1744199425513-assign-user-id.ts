import { MigrationInterface, QueryRunner } from "typeorm";

export class AssignUserId1744199425513 implements MigrationInterface {
    name = 'AssignUserId1744199425513'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IX_availability_site_id"`);
        await queryRunner.query(`DROP INDEX "public"."IX_availability_institution_id"`);
        // await queryRunner.query(`ALTER TABLE "availabilities" ADD "assigned_user_id" integer`);
        await queryRunner.query(`CREATE INDEX "IX_availability_institution_id" ON "appointment" ("institution_id") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IX_availability_institution_id"`);
        await queryRunner.query(`ALTER TABLE "availabilities" DROP COLUMN "assigned_user_id"`);
        await queryRunner.query(`CREATE INDEX "IX_availability_institution_id" ON "availabilities" ("institution_id") `);
        await queryRunner.query(`CREATE INDEX "IX_availability_site_id" ON "availabilities" ("site_id") `);
    }

}

import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAssociatedClassColumn1733862490380 implements MigrationInterface {
    name = 'AddAssociatedClassColumn1733862490380'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "notification_record" ADD "associated_class" jsonb`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "notification_record" DROP COLUMN "associated_class"`);
    }

}

import { MigrationInterface, QueryRunner } from "typeorm";

export class Runs1778372451724 implements MigrationInterface {
    name = 'Runs1778372451724'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "custom_message" ADD "repeater_format" text`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "custom_message" DROP COLUMN "repeater_format"`);
    }

}

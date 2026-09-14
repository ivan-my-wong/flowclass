import { MigrationInterface, QueryRunner } from "typeorm";

export class WhatsappSessionAddTimestampField1743046813932 implements MigrationInterface {
    name = 'WhatsappSessionAddTimestampField1743046813932'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "whatsapp_sessions" ADD "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "whatsapp_sessions" ADD "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`);
        await queryRunner.query(`ALTER TABLE "whatsapp_sessions" ADD "deleted_at" TIMESTAMP WITH TIME ZONE`);
        await queryRunner.query(`ALTER TABLE "whatsapp_sessions" ADD "created_by" integer`);
        await queryRunner.query(`ALTER TABLE "whatsapp_sessions" ADD "updated_by" integer`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "whatsapp_sessions" DROP COLUMN "updated_by"`);
        await queryRunner.query(`ALTER TABLE "whatsapp_sessions" DROP COLUMN "created_by"`);
        await queryRunner.query(`ALTER TABLE "whatsapp_sessions" DROP COLUMN "deleted_at"`);
        await queryRunner.query(`ALTER TABLE "whatsapp_sessions" DROP COLUMN "updated_at"`);
        await queryRunner.query(`ALTER TABLE "whatsapp_sessions" DROP COLUMN "created_at"`);
    }

}

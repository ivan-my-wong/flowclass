import { MigrationInterface, QueryRunner } from "typeorm";

export class WhatsappSessionInstitutionIdNullable1743034597936 implements MigrationInterface {
    name = 'WhatsappSessionInstitutionIdNullable1743034597936'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "whatsapp_sessions" ALTER COLUMN "institution_id" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "whatsapp_sessions" ALTER COLUMN "institution_id" SET NOT NULL`);
    }

}

import { MigrationInterface, QueryRunner } from "typeorm";

export class AddWhatsappTemplateIdFieldAtStep1733264145911 implements MigrationInterface {
    name = 'AddWhatsappTemplateIdFieldAtStep1733264145911'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "automation_flow_steps" ADD "whatsapp_template_id" integer`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "automation_flow_steps" DROP COLUMN "whatsapp_template_id"`);
    }

}

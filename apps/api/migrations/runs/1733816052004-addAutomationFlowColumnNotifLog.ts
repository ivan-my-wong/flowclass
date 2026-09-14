import { MigrationInterface, QueryRunner } from "typeorm";

export class AddAutomationFlowColumnNotifLog1733816052004 implements MigrationInterface {
    name = 'AddAutomationFlowColumnNotifLog1733816052004'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "notification_record" ADD "automation_flow_id" integer`);
        await queryRunner.query(`ALTER TABLE "notification_record" ADD "whatsapp_template_id" integer`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "notification_record" DROP COLUMN "whatsapp_template_id"`);
        await queryRunner.query(`ALTER TABLE "notification_record" DROP COLUMN "automation_flow_id"`);
    }

}

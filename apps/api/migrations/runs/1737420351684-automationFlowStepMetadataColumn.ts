import { MigrationInterface, QueryRunner } from "typeorm";

export class AutomationFlowStepMetadataColumn1737420351684 implements MigrationInterface {
    name = 'AutomationFlowStepMetadataColumn1737420351684'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "invoices" DROP COLUMN "payment_evidence_id"`);
        await queryRunner.query(`ALTER TABLE "automation_flow_steps" ADD "metadata" jsonb`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "automation_flow_steps" DROP COLUMN "metadata"`);
        await queryRunner.query(`ALTER TABLE "invoices" ADD "payment_evidence_id" integer`);
    }

}

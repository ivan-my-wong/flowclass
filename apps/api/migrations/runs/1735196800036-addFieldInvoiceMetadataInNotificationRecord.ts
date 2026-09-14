import { MigrationInterface, QueryRunner } from "typeorm";

export class AddFieldInvoiceMetadataInNotificationRecord1735196800036 implements MigrationInterface {
    name = 'AddFieldInvoiceMetadataInNotificationRecord1735196800036'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "notification_record" ADD "invoice_metadata" jsonb`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "notification_record" DROP COLUMN "invoice_metadata"`);
    }

}

import { MigrationInterface, QueryRunner } from "typeorm";

export class AddColumnSentAtAtNotifRecord1734480047902 implements MigrationInterface {
    name = 'AddColumnSentAtAtNotifRecord1734480047902'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "notification_record" ADD "sent_at" TIMESTAMP WITH TIME ZONE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "notification_record" DROP COLUMN "sent_at"`);
    }

}

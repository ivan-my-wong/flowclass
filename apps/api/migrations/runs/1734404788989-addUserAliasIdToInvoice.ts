import { MigrationInterface, QueryRunner } from "typeorm";

export class AddUserAliasIdToInvoice1734404788989 implements MigrationInterface {
    name = 'AddUserAliasIdToInvoice1734404788989'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "invoices" ADD "user_alias_id" integer`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "invoices" DROP COLUMN "user_alias_id"`);
    }

}

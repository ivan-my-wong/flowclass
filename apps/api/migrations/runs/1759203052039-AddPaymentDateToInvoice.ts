import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPaymentDateToInvoice1759203052039 implements MigrationInterface {
    name = 'AddPaymentDateToInvoice1759203052039'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
      ALTER TABLE invoices ADD COLUMN payment_date DATE NULL;
    `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
      ALTER TABLE invoices DROP COLUMN payment_date;
    `);
    }

}

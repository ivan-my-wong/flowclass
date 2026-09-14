import { MigrationInterface, QueryRunner } from "typeorm";

export class AddEmailAsIndexForUser1739842275261 implements MigrationInterface {
    name = 'AddEmailAsIndexForUser1739842275261'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "student_memo" DROP COLUMN "contact_email"`);
        await queryRunner.query(`ALTER TABLE "student_memo" DROP COLUMN "contact_phone"`);
        await queryRunner.query(`ALTER TABLE "student_memo" DROP COLUMN "contact_name"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "student_memo" ADD "contact_name" character varying`);
        await queryRunner.query(`ALTER TABLE "student_memo" ADD "contact_phone" character varying`);
        await queryRunner.query(`ALTER TABLE "student_memo" ADD "contact_email" character varying`);
    }

}

import { MigrationInterface, QueryRunner } from "typeorm";

export class Runs1774347958232 implements MigrationInterface {
    name = 'Runs1774347958232'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_aliases" ADD "secondary_email" character varying`);
        await queryRunner.query(`ALTER TABLE "student_lesson" ALTER COLUMN "expiry_date" SET DEFAULT NOW() + INTERVAL '30 days'`);
        await queryRunner.query(`ALTER TABLE "courses" ALTER COLUMN "email_settings" SET DEFAULT '{}'::jsonb`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "courses" ALTER COLUMN "email_settings" SET DEFAULT '{}'`);
        await queryRunner.query(`ALTER TABLE "student_lesson" ALTER COLUMN "expiry_date" SET DEFAULT (now() + '30 days')`);
        await queryRunner.query(`ALTER TABLE "user_aliases" DROP COLUMN "secondary_email"`);
    }

}

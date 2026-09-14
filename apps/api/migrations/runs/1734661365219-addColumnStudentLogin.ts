import { MigrationInterface, QueryRunner } from "typeorm";

export class AddColumnStudentLogin1734661365219 implements MigrationInterface {
    name = 'AddColumnStudentLogin1734661365219'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "setting_webpage_institutions" ADD "student_login" boolean`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "setting_webpage_institutions" DROP COLUMN "student_login"`);
    }

}

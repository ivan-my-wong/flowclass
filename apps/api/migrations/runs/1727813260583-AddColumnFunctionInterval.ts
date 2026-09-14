import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddColumnFunctionInterval1727813260583 implements MigrationInterface {
  name = 'AddColumnFunctionInterval1727813260583'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "automation_flow_steps" ADD "label_position" character varying`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "automation_flow_steps" DROP COLUMN "label_position"`)
  }
}

import { MigrationInterface, QueryRunner } from 'typeorm'

export class IncreaseDescriptionLength1732957327983 implements MigrationInterface {
  name = 'IncreaseDescriptionLength1732957327983'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "common_field" ALTER COLUMN "description" TYPE character varying`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "common_field" ALTER COLUMN "description" TYPE character varying(255)`
    )
  }
}

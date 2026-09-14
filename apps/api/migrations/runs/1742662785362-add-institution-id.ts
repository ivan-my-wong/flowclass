import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddInstitutionId1742662785362 implements MigrationInterface {
  name = 'AddInstitutionId1742662785362'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "whatsapp_sessions" ADD "institution_id" character varying NOT NULL`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "whatsapp_sessions" DROP COLUMN "institution_id"`)
  }
}

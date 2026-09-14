import { MigrationInterface, QueryRunner } from 'typeorm'

export class UpdateIntegrationGoogle1761662328306 implements MigrationInterface {
  name = 'UpdateIntegrationGoogle1761662328306'

  public async up(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('integration_google')
    const column = table?.findColumnByName('drive_settings')

    if (!column) {
      await queryRunner.query(`ALTER TABLE "integration_google" ADD "drive_settings" jsonb`)
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('integration_google')
    const column = table?.findColumnByName('drive_settings')

    if (column) {
      await queryRunner.query(`ALTER TABLE "integration_google" DROP COLUMN "drive_settings"`)
    }
  }
}

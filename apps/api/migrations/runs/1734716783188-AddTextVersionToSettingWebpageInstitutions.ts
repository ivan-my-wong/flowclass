import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddTextVersionToSettingWebpageInstitutions1734716783188 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "setting_webpage_institutions" ADD "text_version" VARCHAR`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "setting_webpage_institutions" DROP COLUMN "text_version"`)
  }
}

import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddEmailSettingsToCourses1757850293343 implements MigrationInterface {
  name = 'AddEmailSettingsToCourses1757850293343'
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE courses
      ADD COLUMN email_settings JSONB DEFAULT '{}'::jsonb;
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE courses
      DROP COLUMN email_settings;
    `)
  }
}

import { MigrationInterface, QueryRunner } from 'typeorm'

export class UpdateNullTextVersionToSchool1735099087565 implements MigrationInterface {
  name = 'UpdateNullTextVersionToSchool1735099087565'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        UPDATE setting_webpage_institutions 
        SET text_version = 'school' 
        WHERE text_version IS NULL
      `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        UPDATE setting_webpage_institutions 
        SET text_version = NULL 
        WHERE text_version = 'school'
      `)
  }
}

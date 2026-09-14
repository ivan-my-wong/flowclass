import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddAliasPasswordToUserAliases1754019000000 implements MigrationInterface {
  name = 'AddAliasPasswordToUserAliases1754019000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    // First, add the column as nullable
    await queryRunner.query(`
      ALTER TABLE "user_aliases"
      ADD COLUMN "alias_password" varchar(255)
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "user_aliases"
      DROP COLUMN "alias_password"
    `)
  }
}

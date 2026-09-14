import { MigrationInterface, QueryRunner } from 'typeorm'

export class UpdateUserAliasesForeignKey1739446584871 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_aliases" DROP CONSTRAINT "FK_fd11624e07f3353fcafeb87a357"`
    )
    await queryRunner.query(`
      ALTER TABLE "user_aliases"
      ADD CONSTRAINT "FK_fd11624e07f3353fcafeb87a357"
      FOREIGN KEY ("institution_id") REFERENCES "institutions"("id") ON DELETE CASCADE;
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "user_aliases" DROP CONSTRAINT "FK_fd11624e07f3353fcafeb87a357"`
    )
    await queryRunner.query(`
      ALTER TABLE "user_aliases"
      ADD CONSTRAINT "FK_fd11624e07f3353fcafeb87a357"
      FOREIGN KEY ("institution_id") REFERENCES "institutions"("id") ON DELETE NO ACTION;
    `)
  }
}

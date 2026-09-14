import { MigrationInterface, QueryRunner } from 'typeorm'

export class Runs1749278852039 implements MigrationInterface {
  name = 'Runs1749278852039'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "courses" ADD "require_email_verification" boolean NOT NULL DEFAULT false`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IDX_d0f7199f434f1518e277e16f03"`)
  }
}

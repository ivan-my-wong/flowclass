import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddPrerequesitesCourses1729095614280 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    if (!(await queryRunner.hasColumn('courses', 'prerequisites')))
      await queryRunner.query(
        `ALTER TABLE "courses" ADD COLUMN "prerequisites" jsonb DEFAULT '{}'::jsonb`
      )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "courses" DROP COLUMN "prerequisites"`)
  }
}

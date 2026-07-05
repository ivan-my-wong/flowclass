import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddShortDescriptionToCourses1774200000000
  implements MigrationInterface
{
  name = 'AddShortDescriptionToCourses1774200000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "courses" ADD "short_description" character varying`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "courses" DROP COLUMN "short_description"`
    )
  }
}

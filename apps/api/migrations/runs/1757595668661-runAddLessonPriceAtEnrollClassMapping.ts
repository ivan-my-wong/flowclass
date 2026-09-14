import { MigrationInterface, QueryRunner } from 'typeorm'

export class RunsAddLessonPriceAtEnrollClassMapping1757595668661 implements MigrationInterface {
  name = 'RunsAddLessonPriceAtEnrollClassMapping1757595668661'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "enroll_class_mappings" ADD "lessonPrice" numeric DEFAULT '0'`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "enroll_class_mappings" DROP COLUMN "lessonPrice"`)
  }
}

import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddIsPausedToEnrollCourses1774161439456
  implements MigrationInterface
{
  name = 'AddIsPausedToEnrollCourses1774161439456'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "enroll_courses" ADD "is_paused" boolean NOT NULL DEFAULT false`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "enroll_courses" DROP COLUMN "is_paused"`
    )
  }
}

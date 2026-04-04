import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddRemarksToUserAliases1771600000000 implements MigrationInterface {
  name = 'AddRemarksToUserAliases1771600000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "user_aliases" ADD "remarks" text`)
    await queryRunner.query(
      `CREATE TYPE "public"."student_lesson_has_shared_video_enum" AS ENUM('shared', 'removed', 'pending_share', 'pending_remove', 'no_permission')`
    )
    await queryRunner.query(
      `ALTER TABLE "student_lesson" ADD "has_shared_video" "public"."student_lesson_has_shared_video_enum" NOT NULL DEFAULT 'pending_share'`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "student_lesson" DROP COLUMN "has_shared_video"`)
    await queryRunner.query(`DROP TYPE "public"."student_lesson_has_shared_video_enum"`)
    await queryRunner.query(`ALTER TABLE "user_aliases" DROP COLUMN "remarks"`)
  }
}

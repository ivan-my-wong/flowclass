import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddLessonNameToClassLesson1745076956398 implements MigrationInterface {
  name = 'AddLessonNameToClassLesson1745076956398'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "class_lessons" ADD "lesson_meeting_name" character varying`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "class_lessons" DROP COLUMN "lesson_meeting_name"`)
  }
}

import { MigrationInterface, QueryRunner } from 'typeorm'

export class SetPickedCoursesAtAutomationFlow1730463644767 implements MigrationInterface {
  name = 'SetPickedCoursesAtAutomationFlow1730463644767'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "automation_flow" ADD "picked_courses" jsonb DEFAULT '{}'`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "automation_flow" DROP COLUMN "picked_courses"`)
  }
}

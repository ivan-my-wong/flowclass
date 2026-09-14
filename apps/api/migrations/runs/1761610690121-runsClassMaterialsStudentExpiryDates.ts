import { MigrationInterface, QueryRunner } from 'typeorm'

export class RunsClassMaterialsStudentExpiryDates1761610690121 implements MigrationInterface {
  name = 'RunsClassMaterialsStudentExpiryDates1761610690121'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "class_materials" ADD "student_expiry_dates" jsonb DEFAULT '[]'`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "class_materials" DROP COLUMN "student_expiry_dates"`)
  }
}

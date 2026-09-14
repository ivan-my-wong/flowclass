import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm'

export class AddBlockDuplicateEmailEnrollmentToCourses1760355765630 implements MigrationInterface {
  name = 'AddBlockDuplicateEmailEnrollmentToCourses1760355765630'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'courses',
      new TableColumn({
        name: 'block_duplicate_email_enrollment',
        type: 'boolean',
        default: false,
      })
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('courses', 'block_duplicate_email_enrollment')
  }
}

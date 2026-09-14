import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm'

export class AddClassSpecificStudentRates1759882633191 implements MigrationInterface {
  name = 'AddClassSpecificStudentRates1759882633191'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'instructor_rates',
      new TableColumn({
        name: 'minimum_students',
        type: 'integer',
        isNullable: true,
        comment: 'Class-specific minimum number of students, overrides default if set',
      })
    )

    await queryRunner.addColumn(
      'instructor_rates',
      new TableColumn({
        name: 'additional_salary_per_student',
        type: 'decimal',
        precision: 10,
        scale: 2,
        isNullable: true,
        comment: 'Class-specific additional salary per student, overrides default if set',
      })
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumn('instructor_rates', 'additional_salary_per_student')
    await queryRunner.dropColumn('instructor_rates', 'minimum_students')
  }
}

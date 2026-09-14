import { MigrationInterface, QueryRunner } from 'typeorm'

export class RunAddEnrollCoursesInvoicesTable1759710790360 implements MigrationInterface {
  name = 'RunAddEnrollCoursesInvoicesTable1759710790360'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "enroll_courses_invoices" (
        "invoices_id" integer NOT NULL,
        "enroll_courses_id" integer NOT NULL,
        CONSTRAINT "PK_5ee39d614e4627de6f977dd78b6" PRIMARY KEY ("invoices_id", "enroll_courses_id"),
        CONSTRAINT "FK_enroll_courses_invoices_invoice"
          FOREIGN KEY ("invoices_id") REFERENCES "invoices" ("id") ON DELETE CASCADE,
        CONSTRAINT "FK_enroll_courses_invoices_enroll_course"
          FOREIGN KEY ("enroll_courses_id") REFERENCES "enroll_courses" ("id") ON DELETE CASCADE
      )`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "enroll_courses_invoices"`)
  }
}

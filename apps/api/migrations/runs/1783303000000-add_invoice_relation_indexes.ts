import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddInvoiceRelationIndexes1783303000000 implements MigrationInterface {
  name = 'AddInvoiceRelationIndexes1783303000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Index on student_schedule.invoice_id
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IX_student_schedule_invoice_id" 
      ON public.student_schedule USING BTREE (invoice_id) 
      WHERE deleted_at IS NULL;
    `)

    // Index on payment_evidences.invoice_id
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IX_payment_evidences_invoice_id" 
      ON public.payment_evidences USING BTREE (invoice_id) 
      WHERE deleted_at IS NULL;
    `)

    // Index on enroll_courses.invoice_id
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IX_enroll_courses_invoice_id" 
      ON public.enroll_courses USING BTREE (invoice_id) 
      WHERE deleted_at IS NULL;
    `)

    // Index on course_promotion_used.invoice_id
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IX_course_promotion_used_invoice_id" 
      ON public.course_promotion_used USING BTREE (invoice_id) 
      WHERE deleted_at IS NULL;
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS public."IX_course_promotion_used_invoice_id";`)
    await queryRunner.query(`DROP INDEX IF EXISTS public."IX_enroll_courses_invoice_id";`)
    await queryRunner.query(`DROP INDEX IF EXISTS public."IX_payment_evidences_invoice_id";`)
    await queryRunner.query(`DROP INDEX IF EXISTS public."IX_student_schedule_invoice_id";`)
  }
}

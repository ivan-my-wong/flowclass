import { MigrationInterface, QueryRunner } from 'typeorm'

export class UpdateEnrollCoursesInvoiceIdToLargest1767702800000 implements MigrationInterface {
  name = 'UpdateEnrollCoursesInvoiceIdToLargest1767702800000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Step 1: Check if enroll_courses table has invoice_id column
    const columnExists = await queryRunner.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'enroll_courses'
        AND column_name = 'invoice_id'
      )
    `)

    if (!columnExists[0].exists) {
      console.log('Column invoice_id does not exist in enroll_courses table, skipping migration')
      return
    }

    // Step 2: Check if enroll_courses_invoices table exists
    const tableExists = await queryRunner.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'enroll_courses_invoices'
      )
    `)

    if (!tableExists[0].exists) {
      console.log('Table enroll_courses_invoices does not exist, skipping migration')
      return
    }

    console.log('\n========================================')
    console.log('UPDATING ENROLL_COURSES TO USE LARGEST INVOICE_ID')
    console.log('========================================\n')

    // Step 3: Count enroll_courses with multiple invoices
    const multipleInvoices = await queryRunner.query(`
      SELECT enroll_courses_id, COUNT(*) as invoice_count, MAX(invoices_id) as max_invoice_id
      FROM enroll_courses_invoices
      GROUP BY enroll_courses_id
      HAVING COUNT(*) > 1
    `)

    if (multipleInvoices.length > 0) {
      console.log(`Found ${multipleInvoices.length} enroll_courses with multiple invoices in join table`)
    }

    // Step 4: Update enroll_courses to use the LARGEST invoice_id from the join table
    // This overwrites existing invoice_id if a larger one is available
    // Larger ID is likely newer and not deleted
    await queryRunner.query(`
      UPDATE enroll_courses ec
      SET invoice_id = eci.max_invoice_id
      FROM (
        SELECT 
          enroll_courses_id,
          MAX(invoices_id) as max_invoice_id
        FROM enroll_courses_invoices
        GROUP BY enroll_courses_id
      ) eci
      WHERE ec.id = eci.enroll_courses_id
        AND ec.deleted_at IS NULL
        AND (ec.invoice_id IS NULL OR ec.invoice_id < eci.max_invoice_id)
    `)

    // Step 5: Report results
    const updatedCount = await queryRunner.query(`
      SELECT COUNT(*) as count
      FROM enroll_courses ec
      INNER JOIN (
        SELECT enroll_courses_id, MAX(invoices_id) as max_invoice_id
        FROM enroll_courses_invoices
        GROUP BY enroll_courses_id
      ) eci ON ec.id = eci.enroll_courses_id
      WHERE ec.invoice_id = eci.max_invoice_id
        AND ec.deleted_at IS NULL
    `)

    console.log(`Updated ${updatedCount[0].count} enroll_courses to use the largest invoice_id`)
    console.log('Migration completed successfully\n')
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    console.log('Rollback: This migration cannot be safely rolled back')
    console.log('The previous invoice_id values cannot be restored without additional data')
  }
}


import { MigrationInterface, QueryRunner } from 'typeorm'

export class MigrateEnrollCoursesInvoiceId1767702700000 implements MigrationInterface {
  name = 'MigrateEnrollCoursesInvoiceId1767702700000'

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

    console.log('\n========================================')
    console.log('STARTING ENROLL_COURSES INVOICE_ID MIGRATION')
    console.log('========================================\n')

    // PART 1: Migrate from enroll_courses_invoices join table
    console.log('PART 1: Migrating from enroll_courses_invoices join table...')
    
    const tableExists = await queryRunner.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'enroll_courses_invoices'
      )
    `)

    if (tableExists[0].exists) {
      const countResult = await queryRunner.query(`
        SELECT COUNT(*) as count FROM enroll_courses_invoices
      `)
      const totalCount = parseInt(countResult[0].count)
      console.log(`Found ${totalCount} records in enroll_courses_invoices table`)

      if (totalCount > 0) {
        // Update enroll_courses with the LARGEST invoice_id from the join table
        // This handles cases where multiple invoices exist (larger ID is likely newer/not deleted)
        // Also overwrite existing invoice_id if a larger one is available
        await queryRunner.query(`
          UPDATE enroll_courses ec
          SET invoice_id = eci.invoices_id
          FROM (
            SELECT DISTINCT ON (enroll_courses_id) 
              enroll_courses_id,
              invoices_id
            FROM enroll_courses_invoices
            ORDER BY enroll_courses_id, invoices_id DESC
          ) eci
          WHERE ec.id = eci.enroll_courses_id
            AND ec.deleted_at IS NULL
            AND (ec.invoice_id IS NULL OR ec.invoice_id < eci.invoices_id)
        `)

        const multipleInvoices = await queryRunner.query(`
          SELECT enroll_courses_id, COUNT(*) as invoice_count
          FROM enroll_courses_invoices
          GROUP BY enroll_courses_id
          HAVING COUNT(*) > 1
        `)

        if (multipleInvoices.length > 0) {
          console.warn(
            `Warning: Found ${multipleInvoices.length} enroll_courses with multiple invoices. Using the largest invoice_id (most recent).`
          )
        }
        console.log('Part 1 completed: Migrated from join table\n')
      } else {
        console.log('No records in enroll_courses_invoices table\n')
      }
    } else {
      console.log('enroll_courses_invoices table does not exist, skipping Part 1\n')
    }

    // PART 2: Match remaining enroll_courses to invoices by user_alias_id and course_id
    console.log('PART 2: Matching enroll_courses to invoices by user_alias_id and course_id...')
    
    const countBefore = await queryRunner.query(`
      SELECT COUNT(*) as count 
      FROM enroll_courses 
      WHERE invoice_id IS NULL 
        AND deleted_at IS NULL
        AND user_alias_id IS NOT NULL
        AND course_id IS NOT NULL
    `)
    const countBeforeMatch = parseInt(countBefore[0].count)
    console.log(`Found ${countBeforeMatch} enroll_courses without invoice_id that can be matched`)

    if (countBeforeMatch > 0) {
      await queryRunner.query(`
        UPDATE enroll_courses ec
        SET invoice_id = matched_invoice.invoice_id
        FROM (
          SELECT DISTINCT ON (ec2.id)
            ec2.id as enroll_course_id,
            i.id as invoice_id
          FROM enroll_courses ec2
          INNER JOIN invoices i ON (
            i.user_alias_id = ec2.user_alias_id
            AND i.course_id = ec2.course_id
            AND i.institution_id = ec2.institution_id
            AND i.site_id = ec2.site_id
            AND i.deleted_at IS NULL
          )
          WHERE ec2.invoice_id IS NULL
            AND ec2.deleted_at IS NULL
            AND ec2.user_alias_id IS NOT NULL
            AND ec2.course_id IS NOT NULL
          ORDER BY ec2.id, i.updated_at DESC
        ) matched_invoice
        WHERE ec.id = matched_invoice.enroll_course_id
      `)
      console.log('Part 2 completed: Matched by user_alias_id and course_id\n')
    } else {
      console.log('No enroll_courses to match in Part 2\n')
    }

    // FINAL SUMMARY
    const finalCountWithoutInvoice = await queryRunner.query(`
      SELECT COUNT(*) as count 
      FROM enroll_courses 
      WHERE invoice_id IS NULL 
        AND deleted_at IS NULL
    `)
    const finalCount = parseInt(finalCountWithoutInvoice[0].count)

    const updatedCount = await queryRunner.query(`
      SELECT COUNT(*) as count 
      FROM enroll_courses 
      WHERE invoice_id IS NOT NULL 
        AND deleted_at IS NULL
    `)

    console.log('========================================')
    console.log('MIGRATION SUMMARY')
    console.log('========================================')
    console.log(`Total enroll_courses with invoice_id: ${updatedCount[0].count}`)
    console.log(`TOTAL ENROLL_COURSES WITHOUT INVOICE_ID: ${finalCount}`)
    console.log('========================================\n')

    if (finalCount > 0) {
      const unmatchedCount = await queryRunner.query(`
        SELECT COUNT(*) as count 
        FROM enroll_courses 
        WHERE invoice_id IS NULL 
          AND deleted_at IS NULL
          AND user_alias_id IS NOT NULL
          AND course_id IS NOT NULL
      `)
      const unmatched = parseInt(unmatchedCount[0].count)

      const nullFieldsCount = await queryRunner.query(`
        SELECT COUNT(*) as count 
        FROM enroll_courses 
        WHERE invoice_id IS NULL 
          AND deleted_at IS NULL
          AND (user_alias_id IS NULL OR course_id IS NULL)
      `)
      const nullFields = parseInt(nullFieldsCount[0].count)

      console.log('Breakdown of enroll_courses without invoice_id:')
      if (unmatched > 0) {
        console.warn(
          `  - ${unmatched} enroll_courses could not be matched to invoices (have user_alias_id and course_id but no matching invoice)`
        )
      }
      if (nullFields > 0) {
        console.log(
          `  - ${nullFields} enroll_courses have NULL user_alias_id or course_id (cannot be matched)`
        )
      }
      console.log('')
    } else {
      console.log('All enroll_courses have been successfully matched to invoices!\n')
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    console.log('Rolling back migration: Clearing invoice_id for migrated records')
    
    // Clear invoice_id for records that exist in enroll_courses_invoices
    const tableExists = await queryRunner.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'enroll_courses_invoices'
      )
    `)

    if (tableExists[0].exists) {
      await queryRunner.query(`
        UPDATE enroll_courses ec
        SET invoice_id = NULL
        WHERE EXISTS (
          SELECT 1 
          FROM enroll_courses_invoices eci
          WHERE eci.enroll_courses_id = ec.id
            AND eci.invoices_id = ec.invoice_id
        )
      `)
    }

    // Clear invoice_id for records matched by user_alias_id and course_id
    await queryRunner.query(`
      UPDATE enroll_courses ec
      SET invoice_id = NULL
      WHERE EXISTS (
        SELECT 1 
        FROM invoices i
        WHERE i.id = ec.invoice_id
          AND i.user_alias_id = ec.user_alias_id
          AND i.course_id = ec.course_id
          AND i.institution_id = ec.institution_id
          AND i.site_id = ec.site_id
          AND i.deleted_at IS NULL
      )
        AND ec.deleted_at IS NULL
        AND ec.user_alias_id IS NOT NULL
        AND ec.course_id IS NOT NULL
    `)
    
    console.log('Rollback completed: invoice_id cleared for migrated records')
  }
}


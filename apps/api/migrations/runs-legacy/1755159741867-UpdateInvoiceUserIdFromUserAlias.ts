import { MigrationInterface, QueryRunner } from 'typeorm'

export class UpdateInvoiceUserIdFromUserAlias1755159741867 implements MigrationInterface {
  name = 'UpdateInvoiceUserIdFromUserAlias1755159741867'

  public async up(queryRunner: QueryRunner): Promise<void> {
    console.log('🔄 Starting invoice user_id update from user_alias_id...')

    const checkQuery = `
          SELECT COUNT(*) as count
          FROM invoices i
          INNER JOIN user_aliases ua ON i.user_alias_id = ua.id
         WHERE i.user_alias_id IS NOT NULL
         AND i.user_id IS DISTINCT FROM ua.user_id;
        `

    const checkResult = await queryRunner.query(checkQuery)
    const recordsToUpdate = parseInt(checkResult[0].count)

    console.log(`📊 Found ${recordsToUpdate} invoices that need user_id update`)

    if (recordsToUpdate === 0) {
      console.log('✅ No records need updating. Migration completed.')
      return
    }

    console.log(`🔧 Updating ${recordsToUpdate} invoice records...`)

    const updateQuery = `
          UPDATE invoices 
          SET user_id = ua.user_id,
              updated_at = NOW()
          FROM user_aliases ua
         WHERE invoices.user_alias_id = ua.id
         AND invoices.user_alias_id IS NOT NULL
         AND invoices.user_id IS DISTINCT FROM ua.user_id;
        `

    const updateResult = await queryRunner.query(updateQuery)

    const verifyQuery = `
          SELECT COUNT(*) as remaining_count
          FROM invoices i
          INNER JOIN user_aliases ua ON i.user_alias_id = ua.id
         WHERE i.user_alias_id IS NOT NULL
         AND i.user_id IS DISTINCT FROM ua.user_id;
        `

    const verifyResult = await queryRunner.query(verifyQuery)
    const remainingRecords = parseInt(verifyResult[0].remaining_count)

    if (remainingRecords === 0) {
      console.log('✅ All invoice user_id fields have been successfully updated!')
      console.log(`📈 Updated ${recordsToUpdate} records`)
    } else {
      console.warn(`⚠️  Warning: ${remainingRecords} records still have mismatched user_id`)
      throw new Error(`Migration incomplete: ${remainingRecords} records still need updating`)
    }

    const finalStatsQuery = `
             SELECT 
               COUNT(*) as total_invoices,
               COUNT(user_alias_id) as invoices_with_alias
             FROM invoices;
           `

    const finalStats = await queryRunner.query(finalStatsQuery)
    console.log('📊 Final statistics:')
    console.log(`  Total invoices: ${finalStats[0].total_invoices}`)
    console.log(`  Invoices with user_alias_id: ${finalStats[0].invoices_with_alias}`)

    console.log('🎉 Migration completed successfully!')
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}

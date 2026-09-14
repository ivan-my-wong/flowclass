import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm'

export class AddEzchataccountIdToInstitutionAndCopyToSessions1753546133760
  implements MigrationInterface
{
  name = 'AddEzchataccountIdToInstitutionAndCopyToSessions1753546133760'

  public async up(queryRunner: QueryRunner): Promise<void> {
    console.log('🛠️ Adding ezchataccountId column to whatsapp_sessions table...')

    // Add ezchataccountId column to institutions table
    await queryRunner.addColumn(
      'whatsapp_sessions',
      new TableColumn({
        name: 'ezchat_account_id',
        type: 'int4',
        isNullable: true,
      })
    )

    console.log('✅ Added ezchataccountId column to whatsapp_sessions table')

    // Copy data from whatsapp_account table to whatsapp_sessions table
    console.log('🔄 Copying ezchat_account_id data from whatsapp_account to whatsapp_sessions...')

    await queryRunner.query(`
      UPDATE whatsapp_sessions 
      SET ezchat_account_id = CAST(wa.ezchat_account_id AS INTEGER)
      FROM whatsapp_account wa
      WHERE CAST(whatsapp_sessions.institution_id AS INTEGER) = wa.institution_id
      AND whatsapp_sessions.ezchat_account_id IS NULL
      AND wa.ezchat_account_id ~ '^[0-9]+$'
    `)

    console.log('✅ Copied ezchat_account_id data to whatsapp_sessions table')

    console.log('✅ Migration UP completed')
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    console.log('🧹 Rolling back migration...')

    // Remove unique constraint from institution_id column
    console.log('🧹 Removing unique constraint from institution_id column...')
    await queryRunner.query(`
      ALTER TABLE "whatsapp_sessions" 
      DROP CONSTRAINT "UQ_whatsapp_sessions_institution_id"
    `)
    console.log('✅ Removed unique constraint from institution_id column')

    // Remove ezchataccountId column from whatsapp_sessions table
    console.log('🧹 Removing ezchataccountId column from whatsapp_sessions table...')
    await queryRunner.dropColumn('whatsapp_sessions', 'ezchat_account_id')

    console.log('✅ Migration DOWN completed')
  }
}

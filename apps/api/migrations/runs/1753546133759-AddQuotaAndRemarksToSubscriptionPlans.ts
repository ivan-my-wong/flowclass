import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm'

export class AddQuotaAndRemarksToSubscriptionPlans1753298888000 implements MigrationInterface {
  name = 'AddQuotaAndRemarksToSubscriptionPlans1753298888000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    console.log('🛠️ Adding new columns to subscription_plans...')

    await queryRunner.addColumns('subscription_plans', [
      new TableColumn({
        name: 'remarks',
        type: 'text',
        isNullable: true,
      }),
      new TableColumn({
        name: 'app',
        type: 'varchar',
        isNullable: false,
        default: "'flowclass'",
      }),
    ])

    console.log('✅ Migration UP completed')
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    console.log('🧹 Dropping index idx_active_paid_quota...')
    await queryRunner.query(`DROP INDEX "idx_active_paid_quota"`)

    console.log('🧹 Dropping added columns from subscription_plans...')
    await queryRunner.dropColumn('subscription_plans', 'remarks')
    await queryRunner.dropColumn('subscription_plans', 'max_monthly_notifications')
    await queryRunner.dropColumn('subscription_plans', 'max_clients')

    console.log('✅ Migration DOWN completed')
  }
}

import { MigrationInterface, QueryRunner } from 'typeorm'

export class UpdateAutomationFlowNames1734468062354 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE automation_flow
      SET name = CASE 
        WHEN name = 'Send Reminder After Finish Application' THEN 'Send Notification After Finish Application'
        WHEN name = 'Send Reminder After Admin Approve Payment' THEN 'Send Notification After Admin Approve Payment'
        WHEN name = 'Send Reminder When Add New Lesson' THEN 'Send Notification When Add New Lesson'
        WHEN name = 'Send Reminder When Add New Class' THEN 'Send Notification When Add New Class'
      END
      WHERE name IN (
        'Send Reminder After Finish Application',
        'Send Reminder After Admin Approve Payment',
        'Send Reminder When Add New Lesson',
        'Send Reminder When Add New Class'
      )
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      UPDATE automation_flow
      SET name = CASE 
        WHEN name = 'Send Notification After Finish Application' THEN 'Send Reminder After Finish Application'
        WHEN name = 'Send Notification After Admin Approve Payment' THEN 'Send Reminder After Admin Approve Payment'
        WHEN name = 'Send Notification When Add New Lesson' THEN 'Send Reminder When Add New Lesson'
        WHEN name = 'Send Notification When Add New Class' THEN 'Send Reminder When Add New Class'
      END
      WHERE name IN (
        'Send Notification After Finish Application',
        'Send Notification After Admin Approve Payment',
        'Send Notification When Add New Lesson',
        'Send Notification When Add New Class'
      )
    `)
  }
}

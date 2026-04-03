import { MigrationInterface, QueryRunner } from 'typeorm'

export class RemoveUnusedCustomMessageTypes1774947541000 implements MigrationInterface {
  name = 'RemoveUnusedCustomMessageTypes1774947541000'

  // Types being removed — only keeping 'create_invoice' and 'student_lesson_reminder'
  private readonly removedTypes = [
    'admin_notif_after_enrollment_submitted',
    'student_notif_after_enrollment_submitted',
    'student_notif_after_payment_approved',
    'student_notif_after_payment_rejected',
    'student_notif_after_add_new_class',
    'admin_notif_after_add_new_class',
    'student_notif_after_add_new_lesson',
    'student_notif_after_change_lesson_date',
    'student_notif_payment_reminder',
  ]

  public async up(queryRunner: QueryRunner): Promise<void> {
    const placeholders = this.removedTypes.map((_, i) => `$${i + 1}`).join(', ')

    // Delete custom_message rows with removed types
    await queryRunner.query(
      `DELETE FROM "custom_message" WHERE "type" IN (${placeholders})`,
      this.removedTypes
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Cannot restore deleted rows — they were user-customized content
  }
}

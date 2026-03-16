import { MigrationInterface, QueryRunner } from 'typeorm'

export class MergeStudentMemoIntoUserAlias1731686400000
  implements MigrationInterface
{
  name = 'MergeStudentMemoIntoUserAlias1731686400000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Add new columns to user_aliases
    await queryRunner.query(
      `ALTER TABLE "user_aliases" ADD COLUMN "memo" character varying DEFAULT '' NULL`
    )
    await queryRunner.query(
      `ALTER TABLE "user_aliases" ADD COLUMN "assignable_lesson_count" integer DEFAULT 0 NULL`
    )
    await queryRunner.query(
      `ALTER TABLE "user_aliases" ADD COLUMN "overdue_reminder" jsonb DEFAULT '{}' NULL`
    )
    await queryRunner.query(
      `ALTER TABLE "user_aliases" ADD COLUMN "lesson_reminder" jsonb DEFAULT '{}' NULL`
    )
    await queryRunner.query(
      `ALTER TABLE "user_aliases" ADD COLUMN "payment_reminder" jsonb DEFAULT '{}' NULL`
    )

    // 2. Copy data from student_memo to user_aliases (if table exists)
    const hasStudentMemo = await queryRunner.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'student_memo'
      )
    `)
    if (hasStudentMemo[0]?.exists) {
      // For rows with user_alias_id: copy to that user_alias
      await queryRunner.query(`
      UPDATE "user_aliases" ua
      SET
        memo = COALESCE(sm.memo, ''),
        assignable_lesson_count = COALESCE(sm.assignable_lesson_count, 0),
        overdue_reminder = COALESCE(sm.overdue_reminder, '{}'),
        lesson_reminder = COALESCE(sm.lesson_reminder, '{}'),
        payment_reminder = COALESCE(sm.payment_reminder, '{}')
      FROM "student_memo" sm
      WHERE sm.user_alias_id = ua.id
    `)

    // For rows without user_alias_id: copy to first user_alias for that user+institution
    await queryRunner.query(`
      UPDATE "user_aliases" ua
      SET
        memo = COALESCE(sm.memo, ua.memo, ''),
        assignable_lesson_count = COALESCE(sm.assignable_lesson_count, ua.assignable_lesson_count, 0),
        overdue_reminder = COALESCE(sm.overdue_reminder, ua.overdue_reminder, '{}'),
        lesson_reminder = COALESCE(sm.lesson_reminder, ua.lesson_reminder, '{}'),
        payment_reminder = COALESCE(sm.payment_reminder, ua.payment_reminder, '{}')
      FROM "student_memo" sm
      WHERE sm.user_alias_id IS NULL
        AND sm.user_id = ua.user_id
        AND sm.institution_id = ua.institution_id
        AND ua.id = (
          SELECT MIN(ua2.id) FROM "user_aliases" ua2
          WHERE ua2.user_id = sm.user_id AND ua2.institution_id = sm.institution_id
        )
    `)
    }

    // 3. Drop student_memo table (if exists)
    await queryRunner.query(`DROP TABLE IF EXISTS "student_memo"`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Recreate student_memo table

    await queryRunner.query(`
      CREATE TABLE "student_memo" (
        "id" SERIAL NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP,
        "institution_id" integer NOT NULL,
        "user_id" integer NOT NULL,
        "user_alias_id" integer NULL,
        "memo" character varying DEFAULT '' NULL,
        "assignable_lesson_count" integer DEFAULT 0 NULL,
        "overdue_reminder" jsonb DEFAULT '{}' NULL,
        "lesson_reminder" jsonb DEFAULT '{}' NULL,
        "payment_reminder" jsonb DEFAULT '{}' NULL,
        CONSTRAINT "PK_student_memo" PRIMARY KEY ("id")
      )
    `)

    await queryRunner.query(
      `CREATE INDEX "IX_student_memo_institution_id" ON "student_memo" ("institution_id")`
    )
    await queryRunner.query(
      `CREATE INDEX "IX_student_memo_user_id" ON "student_memo" ("user_id")`
    )
    await queryRunner.query(
      `CREATE INDEX "IX_student_memo_user_alias_id" ON "student_memo" ("user_alias_id")`
    )

    // Copy data back from user_aliases to student_memo
    await queryRunner.query(`
      INSERT INTO "student_memo" (
        institution_id, user_id, user_alias_id, memo,
        assignable_lesson_count, overdue_reminder, lesson_reminder, payment_reminder
      )
      SELECT institution_id, user_id, id, memo,
        assignable_lesson_count, overdue_reminder, lesson_reminder, payment_reminder
      FROM "user_aliases"
      WHERE memo IS NOT NULL AND memo != ''
         OR assignable_lesson_count IS NOT NULL AND assignable_lesson_count != 0
         OR overdue_reminder IS NOT NULL AND overdue_reminder != '{}'
         OR lesson_reminder IS NOT NULL AND lesson_reminder != '{}'
         OR payment_reminder IS NOT NULL AND payment_reminder != '{}'
    `)

    // Remove columns from user_aliases
    await queryRunner.query(`
      ALTER TABLE "user_aliases"
      DROP COLUMN IF EXISTS "memo",
      DROP COLUMN IF EXISTS "assignable_lesson_count",
      DROP COLUMN IF EXISTS "overdue_reminder",
      DROP COLUMN IF EXISTS "lesson_reminder",
      DROP COLUMN IF EXISTS "payment_reminder"
    `)
  }
}

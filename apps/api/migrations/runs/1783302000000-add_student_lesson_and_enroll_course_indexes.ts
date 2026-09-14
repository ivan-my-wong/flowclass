import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddStudentLessonAndEnrollCourseIndexes1783302000000 implements MigrationInterface {
  name = 'AddStudentLessonAndEnrollCourseIndexes1783302000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Index on student_lesson.enroll_course_id (Critical for optimization)
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IX_student_lesson_enroll_course_id" 
      ON public.student_lesson USING BTREE (enroll_course_id) 
      WHERE deleted_at IS NULL;
    `)

    // Index on enroll_courses.confirm_state (Critical for filtering)
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IX_enroll_courses_confirm_state" 
      ON public.enroll_courses USING BTREE (confirm_state) 
      WHERE deleted_at IS NULL;
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS public."IX_enroll_courses_confirm_state";`)
    await queryRunner.query(`DROP INDEX IF EXISTS public."IX_student_lesson_enroll_course_id";`)
  }
}

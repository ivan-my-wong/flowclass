import { MigrationInterface, QueryRunner } from "typeorm";

export class FlipStudentLessonChangeFieldSemantics1779840000000 implements MigrationInterface {
    name = 'FlipStudentLessonChangeFieldSemantics1779840000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Swap class_lesson_id <-> change_class_lesson_id and
        //       start/end_time  <-> change_start/end_time
        // for every student_lesson that has already been changed to a different slot.
        // After this migration:
        //   class_lesson_id / start_time / end_time  = ALWAYS the current/effective slot
        //   change_class_lesson_id / change_start_time / change_end_time = original reference (set once)
        await queryRunner.query(`
            UPDATE student_lesson
            SET
                class_lesson_id        = change_class_lesson_id,
                change_class_lesson_id = class_lesson_id,
                start_time             = change_start_time,
                change_start_time      = start_time,
                end_time               = change_end_time,
                change_end_time        = end_time,
                class_id               = (SELECT class_id  FROM class_lesson WHERE id = change_class_lesson_id),
                course_id              = (SELECT course_id FROM class_lesson WHERE id = change_class_lesson_id)
            WHERE change_class_lesson_id IS NOT NULL
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Reverse: swap back for rows that have change_class_lesson_id set (the original reference)
        await queryRunner.query(`
            UPDATE student_lesson
            SET
                class_lesson_id        = change_class_lesson_id,
                change_class_lesson_id = class_lesson_id,
                start_time             = change_start_time,
                change_start_time      = start_time,
                end_time               = change_end_time,
                change_end_time        = end_time,
                class_id               = (SELECT class_id  FROM class_lesson WHERE id = change_class_lesson_id),
                course_id              = (SELECT course_id FROM class_lesson WHERE id = change_class_lesson_id)
            WHERE change_class_lesson_id IS NOT NULL
        `);
    }
}

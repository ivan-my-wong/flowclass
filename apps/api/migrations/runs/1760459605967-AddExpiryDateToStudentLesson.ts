import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddExpiryDateToStudentLesson1752018865525 implements MigrationInterface {
    name = 'AddExpiryDateToStudentLesson1752018865525';

    public async up(queryRunner: QueryRunner): Promise<void> {
        console.log('📦 Adding expiry_date column to student_lesson table...');

        await queryRunner.query(`
        ALTER TABLE public.student_lesson 
        ADD COLUMN IF NOT EXISTS expiry_date TIMESTAMPTZ NULL;
    `);

        await queryRunner.query(`
        UPDATE public.student_lesson 
        SET expiry_date = COALESCE(created_at, NOW()) + INTERVAL '30 days'
        WHERE expiry_date IS NULL;
    `);

        await queryRunner.query(`
        ALTER TABLE public.student_lesson 
        ALTER COLUMN expiry_date SET NOT NULL;
    `);

        await queryRunner.query(`
        ALTER TABLE public.student_lesson 
        ALTER COLUMN expiry_date SET DEFAULT NOW() + INTERVAL '30 days';
    `);

        await queryRunner.query(`
        CREATE INDEX IF NOT EXISTS idx_student_lesson_expiry_date 
        ON public.student_lesson USING BTREE (expiry_date) 
        WHERE deleted_at IS NULL;
    `);

        await queryRunner.query(`
        CREATE INDEX IF NOT EXISTS idx_student_lesson_active_basic
        ON public.student_lesson USING BTREE (user_id, class_lesson_id)
        WHERE deleted_at IS NULL;
    `);

        await queryRunner.query(`
        CREATE OR REPLACE FUNCTION update_student_lesson_updated_at()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW.updated_at = NOW();
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
    `);

        await queryRunner.query(`
        DROP TRIGGER IF EXISTS update_student_lesson_updated_at_trigger ON public.student_lesson;
    `);

        await queryRunner.query(`
        CREATE TRIGGER update_student_lesson_updated_at_trigger
        BEFORE UPDATE ON public.student_lesson
        FOR EACH ROW EXECUTE FUNCTION update_student_lesson_updated_at();
    `);

        const validation = await queryRunner.query(`
        SELECT COUNT(*) as count FROM public.student_lesson WHERE expiry_date IS NULL;
    `);

        if (parseInt(validation[0].count) > 0) {
            throw new Error(`❌ Migration failed: ${validation[0].count} records still have NULL expiry_date`);
        }

    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            DROP TRIGGER IF EXISTS update_student_lesson_updated_at_trigger ON public.student_lesson;
        `);
        await queryRunner.query(`
            DROP FUNCTION IF EXISTS update_student_lesson_updated_at();
        `);
        await queryRunner.query(`DROP INDEX IF EXISTS idx_student_lesson_expiry_date;`);
        await queryRunner.query(`DROP INDEX IF EXISTS idx_student_lesson_active_basic;`);

        await queryRunner.query(`
            ALTER TABLE public.student_lesson 
            DROP COLUMN IF EXISTS expiry_date;
        `);
    }
}
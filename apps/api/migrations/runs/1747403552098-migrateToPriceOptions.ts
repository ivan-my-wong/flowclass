import { MigrationInterface, QueryRunner } from 'typeorm'

export class MigrateToPriceOptions1747403552098 implements MigrationInterface {
  name = 'MigrateToPriceOptions1747403552098'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
          CREATE TYPE "price_type_enum" AS ENUM ('PER_LESSON', 'PER_CLASS', 'MULTIPLE_OPTIONS')
        `)

    await queryRunner.query(`
          ALTER TABLE "classes" ADD "price_type" price_type_enum NOT NULL DEFAULT 'PER_LESSON'
        `)

    await queryRunner.query(`
          CREATE TABLE "class_price_options" (
            "id" SERIAL PRIMARY KEY,
            "class_id" integer NOT NULL REFERENCES "classes"(id) ON DELETE CASCADE,
            "price_type" price_type_enum NOT NULL DEFAULT 'PER_LESSON',
            "amount" numeric NOT NULL DEFAULT 0,
            "number_of_lessons" integer NOT NULL DEFAULT 1,
            "created_at" TIMESTAMP WITH TIME ZONE DEFAULT now(),
            "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT now(),
            "deleted_at" TIMESTAMP WITH TIME ZONE DEFAULT NULL,
            "created_by" integer,
            "updated_by" integer
          )
        `)

    await queryRunner.query(`
          CREATE INDEX "IX_class_price_options_class_id" ON "class_price_options" ("class_id")
        `)

    // Pre-compute lesson counts using CTE for better performance
    await queryRunner.query(`
          WITH lesson_counts AS (
            SELECT 
              c.id as class_id,
              COALESCE(COUNT(pl.id), 1) as lesson_count
            FROM "classes" c
            LEFT JOIN course_regular_periods rp ON rp.class_id = c.id
            LEFT JOIN period_lessons pl ON rp.id = pl.period_id
            GROUP BY c.id
          )
          INSERT INTO "class_price_options" (
            class_id, 
            price_type, 
            amount, 
            number_of_lessons, 
            created_at, 
            updated_at,
            deleted_at,
            created_by, 
            updated_by
          )
          SELECT 
            c.id, 
            CASE 
              WHEN c.tuition_mode = 'PER_LESSON' THEN 'PER_LESSON'::price_type_enum 
              ELSE 'PER_CLASS'::price_type_enum 
            END, 
            c.tuition, 
            CASE 
              WHEN c.tuition_mode = 'PER_LESSON' THEN 1 
              ELSE lc.lesson_count
            END,
            c.created_at, 
            c.updated_at,
            NULL,
            c.created_by, 
            c.updated_by
          FROM "classes" c
          LEFT JOIN lesson_counts lc ON lc.class_id = c.id
        `)

    await queryRunner.query(`
          UPDATE "classes" c
          SET price_type = 
            CASE 
              WHEN c.tuition_mode = 'PER_LESSON' THEN 'PER_LESSON'::price_type_enum 
              ELSE 'PER_CLASS'::price_type_enum 
            END
        `)

    await queryRunner.query(`ALTER TABLE "enroll_courses" ADD "price_option_id" integer`)
    await queryRunner.query(`ALTER TABLE "invoices" ADD "price_option_id" integer`)

    await queryRunner.query(`
      ALTER TABLE "enroll_courses"
        ADD CONSTRAINT "FK_enroll_courses_price_option"
        FOREIGN KEY ("price_option_id") REFERENCES "class_price_options"(id)
    `)

    //     await queryRunner.query(`
    //       ALTER TABLE "invoices"
    //         ADD CONSTRAINT "FK_invoices_price_option"
    //         FOREIGN KEY ("price_option_id") REFERENCES "class_price_options"(id)
    //     `)

    //     await queryRunner.query(`
    //       UPDATE "enroll_courses" ec
    // SET price_option_id = (
    //   SELECT cpo.id
    //   FROM "class_price_options" cpo
    //   JOIN "classes" c ON cpo.class_id = c.id
    //   WHERE c.course_id = ec.course_id

    //   AND c.name = (
    //     SELECT jsonb_extract_path_text(ec.enroll_into::jsonb, 'secondLevelName')
    //     WHERE jsonb_typeof(ec.enroll_into::jsonb) = 'object'
    //   )
    //   ORDER BY
    //     CASE
    //       WHEN c.tuition_mode = 'PER_LESSON' AND cpo.price_type = 'PER_LESSON' THEN 1
    //       WHEN c.tuition_mode = 'PER_CLASS' AND cpo.price_type = 'PER_CLASS' THEN 1
    //       ELSE 2
    //     END,
    //     cpo.id ASC

    // )
    // WHERE ec.price_option_id IS NULL
    //         `)

    //     await queryRunner.query(`
    //           UPDATE "invoices" i
    //           SET price_option_id = (
    //             SELECT ec.price_option_id
    //             FROM "enroll_courses" ec
    //             WHERE ec.id = i.enroll_id
    //           )
    //           WHERE i.price_option_id IS NULL
    //         `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "classes" ADD "tuition" numeric DEFAULT 0`)
    await queryRunner.query(`ALTER TABLE "classes" ADD "tuition_mode" varchar DEFAULT 'PER_LESSON'`)

    await queryRunner.query(`
          UPDATE "classes" c
          SET 
            tuition = (
              SELECT cpo.amount
              FROM "class_price_options" cpo
              WHERE cpo.class_id = c.id
              LIMIT 1
            ),
            tuition_mode = (
              SELECT 
                CASE WHEN cpo.price_type = 'PER_LESSON' THEN 'PER_LESSON' ELSE 'PER_CLASS' END
              FROM "class_price_options" cpo
              WHERE cpo.class_id = c.id
              LIMIT 1
            )
        `)

    await queryRunner.query(`ALTER TABLE "invoices" DROP CONSTRAINT "FK_invoices_price_option"`)
    await queryRunner.query(
      `ALTER TABLE "enroll_courses" DROP CONSTRAINT "FK_enroll_courses_price_option"`
    )
    await queryRunner.query(`ALTER TABLE "invoices" DROP COLUMN "price_option_id"`)
    await queryRunner.query(`ALTER TABLE "enroll_courses" DROP COLUMN "price_option_id"`)
    await queryRunner.query(`DROP INDEX "IX_class_price_options_class_id"`)
    await queryRunner.query(`DROP TABLE "class_price_options"`)
    await queryRunner.query(`ALTER TABLE "classes" DROP COLUMN "price_type"`)
    await queryRunner.query(`DROP TYPE "price_type_enum"`)
  }
}

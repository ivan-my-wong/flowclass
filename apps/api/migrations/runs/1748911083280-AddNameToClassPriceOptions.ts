import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddNameToClassPriceOptions1748911083280 implements MigrationInterface {
  name = 'AddNameToClassPriceOptions1748911083280'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "class_price_options" 
            ADD COLUMN "name" VARCHAR(255)
          `)

    await queryRunner.query(`
            UPDATE "class_price_options" 
            SET "name" = CASE 
              WHEN "price_type" = 'PER_LESSON' THEN 
                CASE 
                  WHEN "number_of_lessons" = 1 THEN 'Single Lesson'
                  ELSE CONCAT('Package of ', "number_of_lessons", ' Lessons')
                END
              WHEN "price_type" = 'PER_CLASS' THEN 'Full Course'
              WHEN "price_type" = 'MULTIPLE_OPTIONS' THEN 
                CASE 
                  WHEN "number_of_lessons" = 1 THEN 'Single Session'
                  WHEN "number_of_lessons" <= 4 THEN 'Trial Package'
                  WHEN "number_of_lessons" <= 8 THEN 'Basic Package'
                  WHEN "number_of_lessons" <= 16 THEN 'Standard Package'
                  ELSE 'Premium Package'
                END
              ELSE 'Standard Option'
            END
            WHERE "name" IS NULL
          `)
    await queryRunner.query(`
            ALTER TABLE "class_price_options" 
            ALTER COLUMN "name" SET NOT NULL
          `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "class_price_options" 
            DROP COLUMN "name"
          `)
  }
}

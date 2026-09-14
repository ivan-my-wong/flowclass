import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddApplicationPeriodToClasses1756949669999 implements MigrationInterface {
  name = 'AddApplicationPeriodToClasses1756949669999'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "classes" 
            ADD COLUMN "application_period" jsonb NULL
          `)

    // Add index for better performance when filtering by application period
    await queryRunner.query(`
            CREATE INDEX "IX_classes_application_period" 
            ON "classes" USING gin ("application_period")
          `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DROP INDEX "IX_classes_application_period"
          `)

    await queryRunner.query(`
            ALTER TABLE "classes" 
            DROP COLUMN "application_period"
          `)
  }
}

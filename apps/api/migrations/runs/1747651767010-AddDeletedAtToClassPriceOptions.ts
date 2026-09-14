import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddDeletedAtToClassPriceOptions1747651767010 implements MigrationInterface {
  name = 'AddDeletedAtToClassPriceOptions1747651767010'

  public async up(queryRunner: QueryRunner): Promise<void> {
    const columnExists = await queryRunner.hasColumn('class_price_options', 'deleted_at')

    if (!columnExists) {
      await queryRunner.query(`
        ALTER TABLE "class_price_options" 
        ADD "deleted_at" TIMESTAMP WITH TIME ZONE DEFAULT NULL
      `)
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const columnExists = await queryRunner.hasColumn('class_price_options', 'deleted_at')

    if (columnExists) {
      await queryRunner.query(`
        ALTER TABLE "class_price_options" 
        DROP COLUMN "deleted_at"
      `)
    }
  }
}

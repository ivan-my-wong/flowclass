import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddSourceType1755834451853 implements MigrationInterface {
  name = 'AddSourceType1755834451853'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TYPE "public"."credit_transactions_source_type_enum" RENAME TO "credit_transactions_source_type_enum_old"`
    )
    await queryRunner.query(
      `CREATE TYPE "public"."credit_transactions_source_type_enum" AS ENUM('INVOICE_PAYMENT', 'LESSON_BOOKING', 'ADMIN_ADJUSTMENT', 'REFUND', 'EXPIRY', 'MOVE_CREDIT')`
    )
    await queryRunner.query(
      `ALTER TABLE "credit_transactions" ALTER COLUMN "source_type" TYPE "public"."credit_transactions_source_type_enum" USING "source_type"::"text"::"public"."credit_transactions_source_type_enum"`
    )
    await queryRunner.query(`DROP TYPE "public"."credit_transactions_source_type_enum_old"`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."credit_transactions_source_type_enum_old" AS ENUM('INVOICE_PAYMENT', 'LESSON_BOOKING', 'ADMIN_ADJUSTMENT', 'REFUND', 'EXPIRY')`
    )
    await queryRunner.query(
      `ALTER TABLE "credit_transactions" ALTER COLUMN "source_type" TYPE "public"."credit_transactions_source_type_enum_old" USING "source_type"::"text"::"public"."credit_transactions_source_type_enum_old"`
    )
    await queryRunner.query(`DROP TYPE "public"."credit_transactions_source_type_enum"`)
    await queryRunner.query(
      `ALTER TYPE "public"."credit_transactions_source_type_enum_old" RENAME TO "credit_transactions_source_type_enum"`
    )
  }
}

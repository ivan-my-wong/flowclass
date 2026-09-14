import { MigrationInterface, QueryRunner } from 'typeorm'

export class BindCouponsToUserAliasIds1783308000000 implements MigrationInterface {
  name = 'BindCouponsToUserAliasIds1783308000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Add user_alias_ids column
    await queryRunner.query(`
      ALTER TABLE "coupons"
      ADD COLUMN IF NOT EXISTS "user_alias_ids" integer[] DEFAULT '{}'::integer[]
    `)

    // 2. Populate user_alias_ids from user_ids if user_ids exists
    const hasUserIds = await queryRunner.hasColumn('coupons', 'user_ids')
    if (hasUserIds) {
      await queryRunner.query(`
        UPDATE "coupons" c
        SET "user_alias_ids" = COALESCE(
          (
            SELECT array_agg(DISTINCT ua.id)
            FROM "user_aliases" ua
            WHERE ua.user_id = ANY(c.user_ids)
              AND ua.institution_id = c.institution_id
              AND ua.deleted_at IS NULL
          ),
          '{}'::integer[]
        )
        WHERE c.user_ids IS NOT NULL AND cardinality(c.user_ids) > 0;
      `)

      // 3. Drop old user_ids column
      await queryRunner.query(`
        ALTER TABLE "coupons" DROP COLUMN IF EXISTS "user_ids"
      `)
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "coupons"
      ADD COLUMN IF NOT EXISTS "user_ids" integer[] DEFAULT '{}'::integer[]
    `)

    await queryRunner.query(`
      UPDATE "coupons" c
      SET "user_ids" = COALESCE(
        (
          SELECT array_agg(DISTINCT ua.user_id)
          FROM "user_aliases" ua
          WHERE ua.id = ANY(c.user_alias_ids)
            AND ua.user_id IS NOT NULL
        ),
        '{}'::integer[]
      )
      WHERE c.user_alias_ids IS NOT NULL AND cardinality(c.user_alias_ids) > 0;
    `)

    await queryRunner.query(`
      ALTER TABLE "coupons" DROP COLUMN IF EXISTS "user_alias_ids"
    `)
  }
}

import { MigrationInterface, QueryRunner } from 'typeorm'

export class FixBundleDiscountsStructure1691234567890 implements MigrationInterface {
  name = 'FixBundleDiscountsStructure1691234567890'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TABLE IF EXISTS "bundle_discounts" CASCADE;
    `)

    //     await queryRunner.query(`
    //   CREATE TYPE "bundle_discounts_discount_type_enum" AS ENUM('fixedAmount', 'percentage');
    // `)

    await queryRunner.query(`
      CREATE TABLE "bundle_discounts" (
        "id" SERIAL PRIMARY KEY,
        "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMPTZ,
        "created_by" INT,
        "updated_by" INT,

        "site_id" INT NOT NULL,
        "institution_id" INT NOT NULL,

        "name" VARCHAR NOT NULL,

        "discount_type" "bundle_discounts_discount_type_enum" NOT NULL DEFAULT 'fixedAmount',

        "bundle_table" JSONB NOT NULL,

        "is_auto_apply" BOOLEAN NOT NULL DEFAULT false,
        "is_retroactive" BOOLEAN NOT NULL DEFAULT false,
        "is_all_items" BOOLEAN NOT NULL DEFAULT true,
        "applicable_item_ids" INT[],

        "start_date" TIMESTAMP,
        "end_date" TIMESTAMP,
        "is_active" BOOLEAN NOT NULL DEFAULT true,
        "is_stackable" BOOLEAN NOT NULL DEFAULT false
      );
    `)

    await queryRunner.query(
      `CREATE INDEX "IX_bundle_discounts_site_id" ON "bundle_discounts" ("site_id");`
    )
    await queryRunner.query(
      `CREATE INDEX "IX_bundle_discounts_institution_id" ON "bundle_discounts" ("institution_id");`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "bundle_discounts" CASCADE;`)
  }
}

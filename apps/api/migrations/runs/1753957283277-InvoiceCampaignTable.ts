import { MigrationInterface, QueryRunner } from 'typeorm'

export class Runs1753957283277 implements MigrationInterface {
  name = 'Runs1753957283277'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE public.document_campaign ALTER COLUMN document_id DROP NOT NULL`
    )
    await queryRunner.query(
      `ALTER TABLE public.document_campaign ALTER COLUMN user_id DROP NOT NULL`
    )
    // await queryRunner.query(`ALTER TABLE "invoices" ADD "invoice_parent_id" integer`)
    // await queryRunner.query(`ALTER TABLE "invoices" ADD "is_parent" boolean NOT NULL DEFAULT false`)
    await queryRunner.query(
      `ALTER TABLE "invoices" ADD "is_combined" boolean NOT NULL DEFAULT false`
    )
    // await queryRunner.query(
    //   `CREATE INDEX "IX_invoices_parent_id" ON "invoices" ("invoice_parent_id") `
    // )

    // await queryRunner.query(`DROP INDEX "public"."IX_invoices_document_template_id"`)
    await queryRunner.query(
      `ALTER TABLE "invoices" ADD COLUMN "document_campaign_id" bigint DEFAULT NULL`
    )
    await queryRunner.query(
      `CREATE INDEX "IX_invoices_document_campaign_id" ON "invoices" ("document_campaign_id") `
    )

    await queryRunner.query(
      `ALTER TABLE "document_campaign" ADD "send_via_email" boolean NOT NULL DEFAULT true`
    )
    await queryRunner.query(
      `ALTER TABLE "document_campaign" ADD "send_via_whatsapp" boolean NOT NULL DEFAULT true`
    )
    await queryRunner.query(
      `ALTER TABLE "document_campaign" ADD "is_combined" boolean NOT NULL DEFAULT false`
    )
    await queryRunner.query(`ALTER TABLE "document_campaign" ADD "type" character varying`)
    await queryRunner.query(`ALTER TABLE public.document_campaign ADD whatsapp_content text NULL`)
    await queryRunner.query(
      `ALTER TABLE "document_campaign" ADD "metadata" jsonb NOT NULL DEFAULT '{}'`
    )
    await queryRunner.query(
      `ALTER TABLE "document_campaign" ADD COLUMN invoice_ids jsonb DEFAULT '[]'::jsonb`
    )
    await queryRunner.query(`ALTER TABLE "invoices" ADD "manual_discount" jsonb`)
    await queryRunner.query(`ALTER TABLE "invoices" ADD "invoice_ids" jsonb DEFAULT '[]'::jsonb`)
    await queryRunner.query(
      `ALTER TABLE "invoices" ADD "split_type" character varying DEFAULT 'single'`
    )
    await queryRunner.query(`ALTER TABLE "invoices" ADD "split_items" jsonb DEFAULT '[]'::jsonb`)

    // await queryRunner.query(
    //   `ALTER TABLE "activepaid_subscription_plan_records" RENAME COLUMN "plan_ids" TO "plan_id"`
    // )
    await queryRunner.query(
      `ALTER TABLE "bundle_discounts" ADD "amount" integer DEFAULT 0 NOT NULL`
    )
    await queryRunner.query(
      `ALTER TABLE "bundle_discounts" ADD "minQty" integer DEFAULT 0 NOT NULL`
    )
    await queryRunner.query(`ALTER TABLE "invoices" ALTER COLUMN "invoice_ids" SET NOT NULL`)

    // await queryRunner.query(
    //   `ALTER TABLE "activepaid_subscription_plan_records" ADD "plan_id" integer NOT NULL`
    // )
    await queryRunner.query(
      `ALTER TABLE "whatsapp_sessions" ADD CONSTRAINT "UQ_610a7cb0c862ba5ca63d49e9e43" UNIQUE ("institution_id")`
    )
    await queryRunner.query(
      `ALTER TABLE "document_campaign" ADD CONSTRAINT "FK_28d39a0932bdbf40a468c4f3e90" FOREIGN KEY ("institution_id") REFERENCES "institutions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "activepaid_subscription_plan_records" ADD CONSTRAINT "FK_2d8e6704357a5e3b7df6cfcd0ad" FOREIGN KEY ("plan_id") REFERENCES "subscription_plans"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )

    await queryRunner.query(
      `ALTER TABLE "invoices" ADD "admin_discounts" jsonb DEFAULT '[]'::jsonb`
    )
    await queryRunner.query(`ALTER TABLE "document_campaign" ADD "job_id" character varying`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "public"."IX_invoices_parent_id"`)
    await queryRunner.query(`ALTER TABLE "invoices" DROP COLUMN "is_parent"`)
    await queryRunner.query(`ALTER TABLE "invoices" DROP COLUMN "invoice_parent_id"`)
    await queryRunner.query(`DROP INDEX "public"."IX_invoices_document_campaign_id"`)
    await queryRunner.query(`ALTER TABLE "invoices" DROP COLUMN "document_campaign_id"`)
    await queryRunner.query(`ALTER TABLE "document_campaign" DROP COLUMN "type"`)
    await queryRunner.query(`DROP INDEX "public"."IX_invoices_document_campaign_id"`)
    await queryRunner.query(
      `ALTER TABLE "document_campaign" ALTER COLUMN "type" SET DEFAULT 'INVOICE'`
    )
    await queryRunner.query(`ALTER TABLE "document_campaign" DROP COLUMN "send_via_whatsapp"`)
    await queryRunner.query(`ALTER TABLE "document_campaign" DROP COLUMN "send_via_email"`)
    await queryRunner.query(`ALTER TABLE "document_campaign" DROP COLUMN "type"`)
    await queryRunner.query(`ALTER TABLE "document_campaign" DROP COLUMN "is_combined"`)
    await queryRunner.query(`ALTER TABLE "document_campaign" DROP COLUMN "whatsapp_content"`)
    await queryRunner.query(`ALTER TABLE "document_campaign" DROP COLUMN "metadata"`)
    await queryRunner.query(`ALTER TABLE "invoices" DROP COLUMN "invoice_ids"`)
    await queryRunner.query(`ALTER TABLE "invoices" DROP COLUMN "manual_discount"`)
    await queryRunner.query(`ALTER TABLE "invoices" DROP COLUMN "split_items"`)
    await queryRunner.query(`ALTER TABLE "invoices" DROP COLUMN "split_type"`)

    await queryRunner.query(
      `ALTER TABLE "activepaid_subscription_plan_records" DROP CONSTRAINT "FK_2d8e6704357a5e3b7df6cfcd0ad"`
    )
    await queryRunner.query(
      `ALTER TABLE "stripe_connects" DROP CONSTRAINT "FK_62ccc6685413aae1212539d4cc6"`
    )
    await queryRunner.query(
      `ALTER TABLE "document_campaign" DROP CONSTRAINT "FK_28d39a0932bdbf40a468c4f3e90"`
    )
    await queryRunner.query(
      `ALTER TABLE "whatsapp_sessions" DROP CONSTRAINT "UQ_610a7cb0c862ba5ca63d49e9e43"`
    )
    await queryRunner.query(
      `ALTER TABLE "activepaid_subscription_plan_records" DROP COLUMN "plan_id"`
    )
    await queryRunner.query(
      `ALTER TABLE "activepaid_subscription_plan_records" ADD "plan_id" integer array NOT NULL DEFAULT '{}'`
    )
    await queryRunner.query(`ALTER TABLE "invoices" ALTER COLUMN "invoice_ids" DROP NOT NULL`)
    await queryRunner.query(`ALTER TABLE "bundle_discounts" DROP COLUMN "minQty"`)
    await queryRunner.query(`ALTER TABLE "bundle_discounts" DROP COLUMN "amount"`)
    await queryRunner.query(
      `ALTER TABLE "activepaid_subscription_plan_records" RENAME COLUMN "plan_id" TO "plan_ids"`
    )
    await queryRunner.query(`ALTER TABLE "invoices" DROP COLUMN "admin_discounts"`)
    await queryRunner.query(`ALTER TABLE "document_campaign" DROP COLUMN "job_id"`)
  }
}

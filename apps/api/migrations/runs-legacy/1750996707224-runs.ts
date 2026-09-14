import { MigrationInterface, QueryRunner } from 'typeorm'

export class Runs1750996707224 implements MigrationInterface {
  name = 'Runs1750996707224'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "automation_settings" DROP CONSTRAINT "FK_b05acfaa825a3498e468a023f9b"`
    )
    await queryRunner.query(`DROP INDEX "public"."IDX_39a1f5ba3c762d4b1aa389c177"`)
    await queryRunner.query(`ALTER TABLE "stripe_product_prices" DROP COLUMN "metadata"`)
    await queryRunner.query(`ALTER TABLE "stripe_product_prices" DROP COLUMN "active"`)
    await queryRunner.query(`ALTER TABLE "subscription_plans" DROP COLUMN "type_value"`)
    await queryRunner.query(
      `ALTER TABLE "subscription_plans" DROP CONSTRAINT "UQ_6cf73dcde7371159f4cdf19c19f"`
    )
    await queryRunner.query(
      `ALTER TABLE "subscription_plans" DROP COLUMN "stripe_product_price_id"`
    )
    await queryRunner.query(`ALTER TABLE "subscription_plans" DROP COLUMN "plan_id"`)
    await queryRunner.query(`ALTER TABLE "subscription_plan_records" DROP COLUMN "institution_id"`)
    await queryRunner.query(`ALTER TABLE "classes" DROP COLUMN "tuition"`)
    await queryRunner.query(`ALTER TABLE "classes" DROP COLUMN "tuition_mode"`)
    await queryRunner.query(`ALTER TABLE "stripe_connects" DROP COLUMN "subscription_id"`)
    await queryRunner.query(`ALTER TABLE "institutions" DROP COLUMN "subscription"`)
    await queryRunner.query(`ALTER TABLE "integration_xero" DROP COLUMN "user_id"`)
    await queryRunner.query(
      `ALTER TABLE "whatsapp_sessions" DROP CONSTRAINT "UQ_0552b4264825f7300a976ce8605"`
    )
    await queryRunner.query(`ALTER TABLE "whatsapp_sessions" DROP COLUMN "sessionId"`)
    await queryRunner.query(`ALTER TABLE "whatsapp_sessions" DROP COLUMN "sessionData"`)
    await queryRunner.query(
      `ALTER TABLE "stripe_product_prices" ADD "stripe_product_name" character varying NOT NULL DEFAULT 'DEFAULT_PRODUCT_NAME'`
    )
    await queryRunner.query(
      `ALTER TABLE "stripe_product_prices" ADD "is_active" boolean NOT NULL DEFAULT false`
    )
    await queryRunner.query(
      `ALTER TABLE "subscription_plans" ADD "price_mode" character varying NOT NULL`
    )
    await queryRunner.query(`ALTER TABLE "subscription_plans" ADD "type_quota" integer`)
    await queryRunner.query(
      `ALTER TABLE "subscription_plan_records" ADD "site_id" integer NOT NULL`
    )
    await queryRunner.query(
      `ALTER TABLE "subscription_plan_records" ADD "currency" character varying`
    )
    await queryRunner.query(
      `ALTER TABLE "subscription_plan_records" ADD "is_trial" boolean NOT NULL DEFAULT false`
    )
    await queryRunner.query(
      `ALTER TABLE "whatsapp_sessions" ADD "session_id" character varying NOT NULL`
    )
    await queryRunner.query(`ALTER TABLE "whatsapp_sessions" ADD "session_data" jsonb NOT NULL`)
    await queryRunner.query(
      `ALTER TABLE "class_price_options" ALTER COLUMN "created_at" SET NOT NULL`
    )
    await queryRunner.query(
      `ALTER TABLE "class_price_options" ALTER COLUMN "updated_at" SET NOT NULL`
    )
    await queryRunner.query(`ALTER TABLE "class_price_options" DROP COLUMN "price_type"`)
    await queryRunner.query(
      `ALTER TABLE "class_price_options" ADD "price_type" character varying NOT NULL`
    )
    await queryRunner.query(`ALTER TABLE "class_price_options" ALTER COLUMN "name" DROP NOT NULL`)
    await queryRunner.query(`ALTER TABLE "stripe_product_prices" DROP COLUMN "stripe_product_id"`)
    await queryRunner.query(
      `ALTER TABLE "stripe_product_prices" ADD "stripe_product_id" character varying`
    )
    await queryRunner.query(
      `ALTER TABLE "stripe_product_prices" ALTER COLUMN "stripe_price_id" DROP NOT NULL`
    )
    await queryRunner.query(`ALTER TABLE "stripe_product_prices" DROP COLUMN "unit_amount"`)
    await queryRunner.query(
      `ALTER TABLE "stripe_product_prices" ADD "unit_amount" numeric(10,2) NOT NULL`
    )
    await queryRunner.query(`ALTER TABLE "subscription_plans" ALTER COLUMN "tier" SET NOT NULL`)
    await queryRunner.query(
      `ALTER TABLE "subscription_plans" ALTER COLUMN "type_permission" SET DEFAULT '{}'`
    )
    await queryRunner.query(
      `ALTER TABLE "subscription_plans" ALTER COLUMN "type_column_name" SET NOT NULL`
    )
    await queryRunner.query(
      `ALTER TABLE "subscription_plan_records" ALTER COLUMN "plan_ids" SET NOT NULL`
    )
    await queryRunner.query(
      `ALTER TABLE "subscription_plan_records" ALTER COLUMN "plan_ids" SET DEFAULT '{}'`
    )
    await queryRunner.query(
      `ALTER TABLE "subscription_plan_records" ALTER COLUMN "base_user_quantity" SET NOT NULL`
    )
    await queryRunner.query(
      `ALTER TABLE "subscription_plan_records" ALTER COLUMN "base_user_quantity" SET DEFAULT '1'`
    )
    await queryRunner.query(
      `ALTER TABLE "subscription_plan_records" ALTER COLUMN "notification_quantity" SET NOT NULL`
    )
    await queryRunner.query(
      `ALTER TABLE "subscription_plan_records" ALTER COLUMN "notification_quantity" SET DEFAULT '0'`
    )
    await queryRunner.query(
      `ALTER TABLE "subscription_plan_records" ALTER COLUMN "school_quantity" SET NOT NULL`
    )
    await queryRunner.query(
      `ALTER TABLE "subscription_plan_records" ALTER COLUMN "school_quantity" SET DEFAULT '1'`
    )
    await queryRunner.query(
      `ALTER TABLE "subscription_plan_records" ALTER COLUMN "setup_fee_quantity" SET NOT NULL`
    )
    await queryRunner.query(
      `ALTER TABLE "subscription_plan_records" ALTER COLUMN "setup_fee_quantity" SET DEFAULT '1'`
    )
    await queryRunner.query(
      `ALTER TABLE "subscription_plan_records" ALTER COLUMN "admin_quantity" SET NOT NULL`
    )
    await queryRunner.query(
      `ALTER TABLE "subscription_plan_records" ALTER COLUMN "admin_quantity" SET DEFAULT '1'`
    )
    await queryRunner.query(
      `ALTER TABLE "subscription_plan_records" ALTER COLUMN "tutor_quantity" SET NOT NULL`
    )
    await queryRunner.query(
      `ALTER TABLE "subscription_plan_records" ALTER COLUMN "tutor_quantity" SET DEFAULT '1'`
    )
    await queryRunner.query(
      `ALTER TABLE "stripe_product_prices" ADD CONSTRAINT "FK_aeedc0405957b9098ad72c48d1d" FOREIGN KEY ("plan_id") REFERENCES "subscription_plans"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "stripe_connects" DROP CONSTRAINT "FK_62ccc6685413aae1212539d4cc6"`
    )
    await queryRunner.query(
      `ALTER TABLE "automation_settings" DROP CONSTRAINT "FK_c76f0ebc3f0ce1b726777377540"`
    )
    await queryRunner.query(
      `ALTER TABLE "stripe_product_prices" DROP CONSTRAINT "FK_aeedc0405957b9098ad72c48d1d"`
    )
    await queryRunner.query(`DROP INDEX "public"."IDX_610a7cb0c862ba5ca63d49e9e4"`)
    await queryRunner.query(`ALTER TABLE "whatsapp_sessions" DROP COLUMN "institution_id"`)
    await queryRunner.query(
      `ALTER TABLE "whatsapp_sessions" ADD "institution_id" character varying`
    )
    await queryRunner.query(`ALTER TABLE "institutions" DROP COLUMN "plan_expiry_date"`)
    await queryRunner.query(
      `ALTER TABLE "institutions" ADD "plan_expiry_date" TIMESTAMP WITH TIME ZONE`
    )
    await queryRunner.query(
      `ALTER TABLE "institutions" ALTER COLUMN "ai_credit_max" SET DEFAULT '10'`
    )
    await queryRunner.query(`ALTER TABLE "institutions" ALTER COLUMN "ai_credit_max" SET NOT NULL`)
    await queryRunner.query(
      `ALTER TABLE "stripe_connects" DROP CONSTRAINT "UQ_62ccc6685413aae1212539d4cc6"`
    )
    await queryRunner.query(`ALTER TABLE "classes" DROP COLUMN "price_type"`)
    await queryRunner.query(
      `CREATE TYPE "public"."price_type_enum" AS ENUM('PER_LESSON', 'PER_CLASS', 'MULTIPLE_OPTIONS')`
    )
    await queryRunner.query(
      `ALTER TABLE "classes" ADD "price_type" "public"."price_type_enum" NOT NULL DEFAULT 'PER_LESSON'`
    )
    await queryRunner.query(`ALTER TABLE "classes" DROP COLUMN "type"`)
    await queryRunner.query(`DROP TYPE "public"."classes_type_enum"`)
    await queryRunner.query(`ALTER TABLE "classes" ADD "type" character varying`)
    await queryRunner.query(
      `ALTER TABLE "subscription_plan_records" ALTER COLUMN "tutor_quantity" DROP DEFAULT`
    )
    await queryRunner.query(
      `ALTER TABLE "subscription_plan_records" ALTER COLUMN "tutor_quantity" DROP NOT NULL`
    )
    await queryRunner.query(
      `ALTER TABLE "subscription_plan_records" ALTER COLUMN "admin_quantity" DROP DEFAULT`
    )
    await queryRunner.query(
      `ALTER TABLE "subscription_plan_records" ALTER COLUMN "admin_quantity" DROP NOT NULL`
    )
    await queryRunner.query(
      `ALTER TABLE "subscription_plan_records" ALTER COLUMN "setup_fee_quantity" DROP DEFAULT`
    )
    await queryRunner.query(
      `ALTER TABLE "subscription_plan_records" ALTER COLUMN "setup_fee_quantity" DROP NOT NULL`
    )
    await queryRunner.query(
      `ALTER TABLE "subscription_plan_records" ALTER COLUMN "school_quantity" DROP DEFAULT`
    )
    await queryRunner.query(
      `ALTER TABLE "subscription_plan_records" ALTER COLUMN "school_quantity" DROP NOT NULL`
    )
    await queryRunner.query(
      `ALTER TABLE "subscription_plan_records" ALTER COLUMN "notification_quantity" DROP DEFAULT`
    )
    await queryRunner.query(
      `ALTER TABLE "subscription_plan_records" ALTER COLUMN "notification_quantity" DROP NOT NULL`
    )
    await queryRunner.query(
      `ALTER TABLE "subscription_plan_records" ALTER COLUMN "base_user_quantity" DROP DEFAULT`
    )
    await queryRunner.query(
      `ALTER TABLE "subscription_plan_records" ALTER COLUMN "base_user_quantity" DROP NOT NULL`
    )
    await queryRunner.query(
      `ALTER TABLE "subscription_plan_records" ALTER COLUMN "plan_ids" DROP DEFAULT`
    )
    await queryRunner.query(
      `ALTER TABLE "subscription_plan_records" ALTER COLUMN "plan_ids" DROP NOT NULL`
    )
    await queryRunner.query(
      `ALTER TABLE "subscription_plans" ALTER COLUMN "type_column_name" DROP NOT NULL`
    )
    await queryRunner.query(
      `ALTER TABLE "subscription_plans" ALTER COLUMN "type_permission" SET DEFAULT '[]'`
    )
    await queryRunner.query(`ALTER TABLE "subscription_plans" ALTER COLUMN "tier" DROP NOT NULL`)
    await queryRunner.query(`ALTER TABLE "stripe_product_prices" DROP COLUMN "unit_amount"`)
    await queryRunner.query(
      `ALTER TABLE "stripe_product_prices" ADD "unit_amount" integer NOT NULL`
    )
    await queryRunner.query(
      `ALTER TABLE "stripe_product_prices" ALTER COLUMN "stripe_price_id" SET NOT NULL`
    )
    await queryRunner.query(`ALTER TABLE "stripe_product_prices" DROP COLUMN "stripe_product_id"`)
    await queryRunner.query(
      `ALTER TABLE "stripe_product_prices" ADD "stripe_product_id" integer NOT NULL`
    )
    await queryRunner.query(`ALTER TABLE "class_price_options" ALTER COLUMN "name" SET NOT NULL`)
    await queryRunner.query(`ALTER TABLE "class_price_options" DROP COLUMN "price_type"`)
    await queryRunner.query(
      `CREATE TYPE "public"."price_type_enum" AS ENUM('PER_LESSON', 'PER_CLASS', 'MULTIPLE_OPTIONS')`
    )
    await queryRunner.query(
      `ALTER TABLE "class_price_options" ADD "price_type" "public"."price_type_enum"`
    )
    await queryRunner.query(`DROP TYPE IF EXISTS "public"."price_type_enum"`)
    await queryRunner.query(
      `ALTER TABLE "class_price_options" ALTER COLUMN "updated_at" DROP NOT NULL`
    )
    await queryRunner.query(
      `ALTER TABLE "class_price_options" ALTER COLUMN "created_at" DROP NOT NULL`
    )
    await queryRunner.query(`ALTER TABLE "whatsapp_sessions" DROP COLUMN "session_data"`)
    await queryRunner.query(`ALTER TABLE "whatsapp_sessions" DROP COLUMN "session_id"`)
    await queryRunner.query(`ALTER TABLE "subscription_plan_records" DROP COLUMN "is_trial"`)
    await queryRunner.query(`ALTER TABLE "subscription_plan_records" DROP COLUMN "currency"`)
    await queryRunner.query(`ALTER TABLE "subscription_plan_records" DROP COLUMN "site_id"`)
    await queryRunner.query(`ALTER TABLE "subscription_plans" DROP COLUMN "type_quota"`)
    await queryRunner.query(`ALTER TABLE "subscription_plans" DROP COLUMN "price_mode"`)
    await queryRunner.query(`ALTER TABLE "stripe_product_prices" DROP COLUMN "is_active"`)
    await queryRunner.query(`ALTER TABLE "stripe_product_prices" DROP COLUMN "stripe_product_name"`)
    await queryRunner.query(`ALTER TABLE "whatsapp_sessions" ADD "sessionData" jsonb NOT NULL`)
    await queryRunner.query(
      `ALTER TABLE "whatsapp_sessions" ADD "sessionId" character varying NOT NULL`
    )
    await queryRunner.query(
      `ALTER TABLE "whatsapp_sessions" ADD CONSTRAINT "UQ_0552b4264825f7300a976ce8605" UNIQUE ("sessionId")`
    )
    await queryRunner.query(`ALTER TABLE "integration_xero" ADD "user_id" integer NOT NULL`)
    await queryRunner.query(`ALTER TABLE "institutions" ADD "subscription" character varying`)
    await queryRunner.query(`ALTER TABLE "stripe_connects" ADD "subscription_id" character varying`)
    await queryRunner.query(
      `ALTER TABLE "classes" ADD "tuition_mode" character varying NOT NULL DEFAULT 'PER_LESSON'`
    )
    await queryRunner.query(`ALTER TABLE "classes" ADD "tuition" numeric NOT NULL DEFAULT '0'`)
    await queryRunner.query(
      `ALTER TABLE "subscription_plan_records" ADD "institution_id" integer NOT NULL`
    )
    await queryRunner.query(`ALTER TABLE "subscription_plans" ADD "plan_id" character varying`)
    await queryRunner.query(
      `ALTER TABLE "subscription_plans" ADD "stripe_product_price_id" integer`
    )
    await queryRunner.query(
      `ALTER TABLE "subscription_plans" ADD CONSTRAINT "UQ_6cf73dcde7371159f4cdf19c19f" UNIQUE ("stripe_product_price_id")`
    )
    await queryRunner.query(`ALTER TABLE "subscription_plans" ADD "type_value" character varying`)
    await queryRunner.query(
      `ALTER TABLE "stripe_product_prices" ADD "active" boolean NOT NULL DEFAULT false`
    )
    await queryRunner.query(`ALTER TABLE "stripe_product_prices" ADD "metadata" jsonb NOT NULL`)
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_39a1f5ba3c762d4b1aa389c177" ON "integration_xero" ("user_id") `
    )
    await queryRunner.query(
      `ALTER TABLE "automation_settings" ADD CONSTRAINT "FK_b05acfaa825a3498e468a023f9b" FOREIGN KEY ("institution_id") REFERENCES "institutions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "invoices" ADD CONSTRAINT "FK_invoices_price_option" FOREIGN KEY ("price_option_id") REFERENCES "class_price_options"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
    await queryRunner.query(
      `ALTER TABLE "enroll_courses" ADD CONSTRAINT "FK_enroll_courses_price_option" FOREIGN KEY ("price_option_id") REFERENCES "class_price_options"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    )
  }
}

import { MigrationInterface, QueryRunner } from "typeorm";

export class StudentFormAddFormFieldAsMetadataCopy1740356553215 implements MigrationInterface {
    name = 'StudentFormAddFormFieldAsMetadataCopy1740356553215'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_aliases" DROP CONSTRAINT "FK_fd11624e07f3353fcafeb87a357"`);
        await queryRunner.query(`ALTER TABLE "student_form" ADD "form_field_id" character varying`);
        await queryRunner.query(`COMMENT ON COLUMN "student_form"."form_field_id" IS 'Refers to metadata.id'`);
        await queryRunner.query(`ALTER TABLE "student_form" ADD "form_field_question" character varying`);
        await queryRunner.query(`COMMENT ON COLUMN "student_form"."form_field_question" IS 'Refers to metadata.question'`);
        await queryRunner.query(`ALTER TABLE "student_form" ADD "form_field_type" character varying`);
        await queryRunner.query(`COMMENT ON COLUMN "student_form"."form_field_type" IS 'Refers to metadata.type'`);
        await queryRunner.query(`ALTER TABLE "student_form" ADD "form_field_value" character varying`);
        await queryRunner.query(`COMMENT ON COLUMN "student_form"."form_field_value" IS 'Refers to metadata.value'`);
        await queryRunner.query(`ALTER TABLE "student_form" ADD "form_field_is_default" boolean`);
        await queryRunner.query(`COMMENT ON COLUMN "student_form"."form_field_is_default" IS 'Refers to metadata.isDefault'`);
        await queryRunner.query(`ALTER TABLE "student_form" ADD "form_field_order" integer`);
        await queryRunner.query(`COMMENT ON COLUMN "student_form"."form_field_order" IS 'Refers to metadata.order'`);
        await queryRunner.query(`ALTER TABLE "student_form" ADD "form_field_column_mapping" character varying`);
        await queryRunner.query(`COMMENT ON COLUMN "student_form"."form_field_column_mapping" IS 'Refers to metadata.columnMapping'`);
        await queryRunner.query(`ALTER TABLE "student_form" ALTER COLUMN "metadata" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "student_form" ALTER COLUMN "metadata" SET DEFAULT '{}'`);
        await queryRunner.query(`ALTER TABLE "student_lesson" DROP COLUMN "attendance"`);
        await queryRunner.query(`CREATE TYPE "public"."student_lesson_attendance_enum" AS ENUM('ATTENDED', 'NOT_ATTENDED', 'PENDING', 'CANCELLED', 'POSTPONE', 'DEDUCT')`);
        await queryRunner.query(`ALTER TABLE "student_lesson" ADD "attendance" "public"."student_lesson_attendance_enum" NOT NULL DEFAULT 'PENDING'`);
        await queryRunner.query(`ALTER TABLE "stripe_product_prices" DROP COLUMN "type"`);
        await queryRunner.query(`DROP TYPE "public"."stripe_product_prices_type_enum"`);
        await queryRunner.query(`ALTER TABLE "stripe_product_prices" ADD "type" character varying`);
        await queryRunner.query(`ALTER TABLE "stripe_product_prices" DROP COLUMN "interval"`);
        await queryRunner.query(`DROP TYPE "public"."stripe_product_prices_interval_enum"`);
        await queryRunner.query(`ALTER TABLE "stripe_product_prices" ADD "interval" character varying`);
        await queryRunner.query(`CREATE INDEX "IDX_97672ac88f789774dd47f7c8be" ON "users" ("email") `);
        await queryRunner.query(`ALTER TABLE "user_aliases" ADD CONSTRAINT "FK_fd11624e07f3353fcafeb87a357" FOREIGN KEY ("institution_id") REFERENCES "institutions"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_aliases" DROP CONSTRAINT "FK_fd11624e07f3353fcafeb87a357"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_97672ac88f789774dd47f7c8be"`);
        await queryRunner.query(`ALTER TABLE "stripe_product_prices" DROP COLUMN "interval"`);
        await queryRunner.query(`CREATE TYPE "public"."stripe_product_prices_interval_enum" AS ENUM('month', 'year', 'week', 'day')`);
        await queryRunner.query(`ALTER TABLE "stripe_product_prices" ADD "interval" "public"."stripe_product_prices_interval_enum"`);
        await queryRunner.query(`ALTER TABLE "stripe_product_prices" DROP COLUMN "type"`);
        await queryRunner.query(`CREATE TYPE "public"."stripe_product_prices_type_enum" AS ENUM('recurring', 'one_time')`);
        await queryRunner.query(`ALTER TABLE "stripe_product_prices" ADD "type" "public"."stripe_product_prices_type_enum" NOT NULL`);
        await queryRunner.query(`ALTER TABLE "student_lesson" DROP COLUMN "attendance"`);
        await queryRunner.query(`DROP TYPE "public"."student_lesson_attendance_enum"`);
        await queryRunner.query(`ALTER TABLE "student_lesson" ADD "attendance" character varying NOT NULL DEFAULT 'PENDING'`);
        await queryRunner.query(`ALTER TABLE "student_form" ALTER COLUMN "metadata" DROP DEFAULT`);
        await queryRunner.query(`ALTER TABLE "student_form" ALTER COLUMN "metadata" SET NOT NULL`);
        await queryRunner.query(`COMMENT ON COLUMN "student_form"."form_field_column_mapping" IS 'Refers to metadata.columnMapping'`);
        await queryRunner.query(`ALTER TABLE "student_form" DROP COLUMN "form_field_column_mapping"`);
        await queryRunner.query(`COMMENT ON COLUMN "student_form"."form_field_order" IS 'Refers to metadata.order'`);
        await queryRunner.query(`ALTER TABLE "student_form" DROP COLUMN "form_field_order"`);
        await queryRunner.query(`COMMENT ON COLUMN "student_form"."form_field_is_default" IS 'Refers to metadata.isDefault'`);
        await queryRunner.query(`ALTER TABLE "student_form" DROP COLUMN "form_field_is_default"`);
        await queryRunner.query(`COMMENT ON COLUMN "student_form"."form_field_value" IS 'Refers to metadata.value'`);
        await queryRunner.query(`ALTER TABLE "student_form" DROP COLUMN "form_field_value"`);
        await queryRunner.query(`COMMENT ON COLUMN "student_form"."form_field_type" IS 'Refers to metadata.type'`);
        await queryRunner.query(`ALTER TABLE "student_form" DROP COLUMN "form_field_type"`);
        await queryRunner.query(`COMMENT ON COLUMN "student_form"."form_field_question" IS 'Refers to metadata.question'`);
        await queryRunner.query(`ALTER TABLE "student_form" DROP COLUMN "form_field_question"`);
        await queryRunner.query(`COMMENT ON COLUMN "student_form"."form_field_id" IS 'Refers to metadata.id'`);
        await queryRunner.query(`ALTER TABLE "student_form" DROP COLUMN "form_field_id"`);
        await queryRunner.query(`ALTER TABLE "user_aliases" ADD CONSTRAINT "FK_fd11624e07f3353fcafeb87a357" FOREIGN KEY ("institution_id") REFERENCES "institutions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}

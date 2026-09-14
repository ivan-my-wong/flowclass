import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddNotificationRecordPerformanceIndex1783304000000 implements MigrationInterface {
  name = 'AddNotificationRecordPerformanceIndex1783304000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Composite index for queries filtering by site_id, institution_id, and created_at (where deleted_at IS NULL)
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IX_notification_record_site_institution_created" 
      ON public.notification_record USING BTREE (site_id, institution_id, created_at) 
      WHERE deleted_at IS NULL;
    `)

    // Composite index for queries filtering by site_id and created_at (where deleted_at IS NULL)
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IX_notification_record_site_created" 
      ON public.notification_record USING BTREE (site_id, created_at) 
      WHERE deleted_at IS NULL;
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS public."IX_notification_record_site_created";`)
    await queryRunner.query(`DROP INDEX IF EXISTS public."IX_notification_record_site_institution_created";`)
  }
}

import { MigrationInterface, QueryRunner } from 'typeorm'

export class EnableRLSOnAllTables1774300000000
  implements MigrationInterface
{
  name = 'EnableRLSOnAllTables1774300000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$
      DECLARE
          r RECORD;
      BEGIN
          FOR r IN 
              SELECT tablename 
              FROM pg_tables 
              WHERE schemaname = 'public' 
                AND tablename NOT IN ('migrations', 'spatial_ref_sys')
          LOOP
              EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY;', r.tablename);
          END LOOP;
      END $$;
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$
      DECLARE
          r RECORD;
      BEGIN
          FOR r IN 
              SELECT tablename 
              FROM pg_tables 
              WHERE schemaname = 'public' 
                AND tablename NOT IN ('migrations', 'spatial_ref_sys')
          LOOP
              EXECUTE format('ALTER TABLE public.%I DISABLE ROW LEVEL SECURITY;', r.tablename);
          END LOOP;
      END $$;
    `)
  }
}

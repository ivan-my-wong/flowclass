import { MigrationInterface, QueryRunner } from 'typeorm'

export class EnableRLSForRemainingTables1774400000000
  implements MigrationInterface
{
  name = 'EnableRLSForRemainingTables1774400000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE IF EXISTS public.divit_configs ENABLE ROW LEVEL SECURITY;
      ALTER TABLE IF EXISTS public.divit_orders ENABLE ROW LEVEL SECURITY;
      ALTER TABLE IF EXISTS public.student_memo ENABLE ROW LEVEL SECURITY;
      ALTER TABLE IF EXISTS public.migrations ENABLE ROW LEVEL SECURITY;
    `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE IF EXISTS public.divit_configs DISABLE ROW LEVEL SECURITY;
      ALTER TABLE IF EXISTS public.divit_orders DISABLE ROW LEVEL SECURITY;
      ALTER TABLE IF EXISTS public.student_memo DISABLE ROW LEVEL SECURITY;
      ALTER TABLE IF EXISTS public.migrations DISABLE ROW LEVEL SECURITY;
    `)
  }
}

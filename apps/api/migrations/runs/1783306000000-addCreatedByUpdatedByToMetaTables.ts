import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddCreatedByUpdatedByToMetaTables1783306000000 implements MigrationInterface {
  name = 'AddCreatedByUpdatedByToMetaTables1783306000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    const tables = [
      'meta_embedded_signups',
      'whatsapp_provider_connections',
      'meta_provider_credentials',
      'meta_coexistence_sync_checkpoints',
    ]

    for (const table of tables) {
      await queryRunner.query(
        `ALTER TABLE "${table}" ADD COLUMN IF NOT EXISTS "created_by" integer, ADD COLUMN IF NOT EXISTS "updated_by" integer;`
      )
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const tables = [
      'meta_embedded_signups',
      'whatsapp_provider_connections',
      'meta_provider_credentials',
      'meta_coexistence_sync_checkpoints',
    ]

    for (const table of tables) {
      await queryRunner.query(
        `ALTER TABLE "${table}" DROP COLUMN IF EXISTS "created_by", DROP COLUMN IF EXISTS "updated_by";`
      )
    }
  }
}

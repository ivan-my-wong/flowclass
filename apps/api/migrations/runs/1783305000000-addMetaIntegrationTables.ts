import { MigrationInterface, QueryRunner, Table, TableColumn, TableIndex } from 'typeorm'

export class AddMetaIntegrationTables1783305000000 implements MigrationInterface {
  name = 'AddMetaIntegrationTables1783305000000'

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Create meta_embedded_signups table
    await queryRunner.createTable(
      new Table({
        name: 'meta_embedded_signups',
        columns: [
          {
            name: 'id',
            type: 'serial',
            isPrimary: true,
          },
          {
            name: 'institution_id',
            type: 'int4',
            isUnique: true,
          },
          {
            name: 'business_id',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'configuration_id',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'embedded_signup_state',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'state_expires_at',
            type: 'timestamptz',
            isNullable: true,
          },
          {
            name: 'state_consumed_at',
            type: 'timestamptz',
            isNullable: true,
          },
          {
            name: 'authorization_code',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'granted_scopes',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'is_coexistence',
            type: 'boolean',
            isNullable: true,
          },
          {
            name: 'provisioning_step',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'provisioning_attempts',
            type: 'integer',
            default: 0,
          },
          {
            name: 'last_error_code',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'last_error_message',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'status',
            type: 'varchar',
            default: "'initiated'",
          },
          {
            name: 'embedded_signup_payload',
            type: 'jsonb',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamptz',
            default: 'now()',
          },
          {
            name: 'updated_at',
            type: 'timestamptz',
            default: 'now()',
          },
          {
            name: 'deleted_at',
            type: 'timestamptz',
            isNullable: true,
          },
          {
            name: 'created_by',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'updated_by',
            type: 'int',
            isNullable: true,
          },
        ],
      }),
      true
    )

    await queryRunner.query(
      'CREATE INDEX IF NOT EXISTS "IX_meta_embedded_signups_institution_id" ON "meta_embedded_signups" ("institution_id")'
    )

    // 2. Create whatsapp_provider_connections table
    await queryRunner.createTable(
      new Table({
        name: 'whatsapp_provider_connections',
        columns: [
          {
            name: 'id',
            type: 'serial',
            isPrimary: true,
          },
          {
            name: 'institution_id',
            type: 'int4',
            isUnique: true,
          },
          {
            name: 'provider',
            type: 'varchar',
            default: "'meta_cloud'",
          },
          {
            name: 'status',
            type: 'varchar',
            default: "'pending'",
          },
          {
            name: 'display_phone_number',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'external_phone_number_id',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'connected_at',
            type: 'timestamptz',
            isNullable: true,
          },
          {
            name: 'last_health_check_at',
            type: 'timestamptz',
            isNullable: true,
          },
          {
            name: 'status_reason',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'waba_id',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'verified_name',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'is_system_user',
            type: 'boolean',
            default: false,
          },
          {
            name: 'created_at',
            type: 'timestamptz',
            default: 'now()',
          },
          {
            name: 'updated_at',
            type: 'timestamptz',
            default: 'now()',
          },
          {
            name: 'deleted_at',
            type: 'timestamptz',
            isNullable: true,
          },
          {
            name: 'created_by',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'updated_by',
            type: 'int',
            isNullable: true,
          },
        ],
      }),
      true
    )

    await queryRunner.query(
      'CREATE INDEX IF NOT EXISTS "IX_whatsapp_provider_connections_institution_id" ON "whatsapp_provider_connections" ("institution_id")'
    )

    // 3. Create meta_provider_credentials table
    await queryRunner.createTable(
      new Table({
        name: 'meta_provider_credentials',
        columns: [
          {
            name: 'id',
            type: 'serial',
            isPrimary: true,
          },
          {
            name: 'connection_id',
            type: 'int4',
            isUnique: true,
          },
          {
            name: 'access_token',
            type: 'text',
          },
          {
            name: 'token_expires_at',
            type: 'timestamptz',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamptz',
            default: 'now()',
          },
          {
            name: 'updated_at',
            type: 'timestamptz',
            default: 'now()',
          },
          {
            name: 'deleted_at',
            type: 'timestamptz',
            isNullable: true,
          },
          {
            name: 'created_by',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'updated_by',
            type: 'int',
            isNullable: true,
          },
        ],
      }),
      true
    )

    // 4. Create meta_coexistence_sync_checkpoints table
    await queryRunner.createTable(
      new Table({
        name: 'meta_coexistence_sync_checkpoints',
        columns: [
          {
            name: 'id',
            type: 'serial',
            isPrimary: true,
          },
          {
            name: 'institution_id',
            type: 'int4',
          },
          {
            name: 'sync_type',
            type: 'varchar',
          },
          {
            name: 'status',
            type: 'varchar',
          },
          {
            name: 'phase',
            type: 'integer',
            isNullable: true,
          },
          {
            name: 'chunk_order',
            type: 'integer',
            isNullable: true,
          },
          {
            name: 'progress',
            type: 'integer',
            isNullable: true,
          },
          {
            name: 'processed_items',
            type: 'integer',
            default: 0,
          },
          {
            name: 'last_event_at',
            type: 'timestamptz',
            isNullable: true,
          },
          {
            name: 'last_error',
            type: 'text',
            isNullable: true,
          },
          {
            name: 'created_at',
            type: 'timestamptz',
            default: 'now()',
          },
          {
            name: 'updated_at',
            type: 'timestamptz',
            default: 'now()',
          },
          {
            name: 'deleted_at',
            type: 'timestamptz',
            isNullable: true,
          },
          {
            name: 'created_by',
            type: 'int',
            isNullable: true,
          },
          {
            name: 'updated_by',
            type: 'int',
            isNullable: true,
          },
        ],
      }),
      true
    )

    await queryRunner.query(
      'CREATE INDEX IF NOT EXISTS "IX_meta_coexistence_sync_checkpoints_institution_id" ON "meta_coexistence_sync_checkpoints" ("institution_id")'
    )

    // 5. Update whatsapp_template table with meta columns
    const columnsToAdd = [
      new TableColumn({
        name: 'provider',
        type: 'varchar',
        default: "'meta_cloud'",
        isNullable: true,
      }),
      new TableColumn({
        name: 'friendly_name',
        type: 'varchar',
        default: "''",
        isNullable: true,
      }),
      new TableColumn({
        name: 'meta_template_id',
        type: 'varchar',
        isNullable: true,
      }),
      new TableColumn({
        name: 'meta_response',
        type: 'jsonb',
        isNullable: true,
      }),
      new TableColumn({
        name: 'types',
        type: 'jsonb',
        isNullable: true,
      }),
    ]

    for (const column of columnsToAdd) {
      const hasColumn = await queryRunner.hasColumn('whatsapp_template', column.name)
      if (!hasColumn) {
        await queryRunner.addColumn('whatsapp_template', column)
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('meta_coexistence_sync_checkpoints', true)
    await queryRunner.dropTable('meta_provider_credentials', true)
    await queryRunner.dropTable('whatsapp_provider_connections', true)
    await queryRunner.dropTable('meta_embedded_signups', true)
  }
}

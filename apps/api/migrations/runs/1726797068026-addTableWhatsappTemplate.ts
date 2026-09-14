import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddTableWhatsappTemplate1726797068026 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    if (!(await queryRunner.hasTable('whatsapp_template')))
      queryRunner.query(`
            CREATE TABLE whatsapp_template (
                id SERIAL4 PRIMARY KEY, 
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),  
                updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),  
                deleted_at TIMESTAMPTZ DEFAULT NULL,
                created_by INT,
                updated_by INT,
                institution_id INT NOT NULL,
                content TEXT,
                name VARCHAR(255) NOT NULL,
                content_type VARCHAR(255) DEFAULT 'twilio/text',
                twilio_content_id VARCHAR(255) DEFAULT NULL,
                language VARCHAR(255) DEFAULT 'en',
                status VARCHAR(255) DEFAULT 'Unsubmitted',
                category VARCHAR(255) DEFAULT 'Utility',
                variables jsonb NULL,
                twilio_response jsonb NULL,
                is_default BOOLEAN DEFAULT false,
                assigned_to jsonb DEFAULT '{}'
                )
            `)

    queryRunner.query(`
            CREATE INDEX IX_whatsapp_template_institution_id ON whatsapp_template (institution_id);
            `)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    queryRunner.query(`DROP TABLE whatsapp_template`)
    queryRunner.query(`DROP INDEX IX_whatsapp_template_institution_id`)
  }
}

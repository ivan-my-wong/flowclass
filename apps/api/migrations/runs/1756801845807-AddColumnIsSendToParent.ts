import { MigrationInterface, QueryRunner } from 'typeorm'

export class AddColumnIsSendToParent1756801845807 implements MigrationInterface {
  name = 'AddColumnIsSendToParent1756801845807'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "document_campaign_recipients" ADD "is_send_to_parent" boolean NOT NULL DEFAULT false`
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "document_campaign_recipients" DROP COLUMN "is_send_to_parent"`
    )
  }
}

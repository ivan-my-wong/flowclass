import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm'

export class Runs1753687113013SetApp implements MigrationInterface {
  name = 'Runs17536871130134SetApp'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumns('subscription_plan_records', [
      new TableColumn({
        name: 'app',
        type: 'varchar',
        isNullable: false,
        default: "'flowclass'",
      }),
    ])

    // remove foreign key constraint from automation_flow
    await queryRunner.dropForeignKey('automation_flow', 'FK_d18652305594ca243b6b0557c57')
  }

  public async down(queryRunner: QueryRunner): Promise<void> {}
}

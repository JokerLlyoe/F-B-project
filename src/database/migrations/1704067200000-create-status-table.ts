import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateStatusTable1704067200000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'order_statuses',
        columns: [
          { name: 'id', type: 'serial', isPrimary: true },
          { name: 'status', type: 'varchar', isUnique: true },
          { name: 'label', type: 'varchar' },
          { name: 'description', type: 'varchar', isNullable: true },
          { name: 'order', type: 'int', default: 0 },
          { name: 'createdAt', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
          { name: 'updatedAt', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('order_statuses');
  }
}

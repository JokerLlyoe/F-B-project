import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateOrdersTable1704067200002 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'orders',
        columns: [
          { name: 'id', type: 'serial', isPrimary: true },
          { name: 'customerName', type: 'varchar' },
          { name: 'customerPhone', type: 'varchar' },
          { name: 'customerEmail', type: 'varchar', isNullable: true },
          { name: 'totalAmount', type: 'decimal', precision: 10, scale: 2 },
          { name: 'orderType', type: 'enum', enum: ['delivery', 'pickup'] },
          { name: 'deliveryAddress', type: 'varchar', isNullable: true },
          { name: 'statusId', type: 'int' },
          { name: 'createdAt', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
          { name: 'updatedAt', type: 'timestamp', default: 'CURRENT_TIMESTAMP' },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'orders',
      new TableForeignKey({
        columnNames: ['statusId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'order_statuses',
        onDelete: 'RESTRICT',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('orders');
  }
}

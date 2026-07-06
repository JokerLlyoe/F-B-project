import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateOrderItemsTable1704067200003 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'order_items',
        columns: [
          { name: 'id', type: 'serial', isPrimary: true },
          { name: 'orderId', type: 'int' },
          { name: 'menuItemId', type: 'int' },
          { name: 'quantity', type: 'int' },
          { name: 'unitPrice', type: 'decimal', precision: 10, scale: 2 },
          { name: 'subtotal', type: 'decimal', precision: 10, scale: 2 },
          { name: 'notes', type: 'varchar', isNullable: true },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'order_items',
      new TableForeignKey({
        columnNames: ['orderId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'orders',
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'order_items',
      new TableForeignKey({
        columnNames: ['menuItemId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'menu_items',
        onDelete: 'RESTRICT',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('order_items');
  }
}

import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedStatusData1704067200004 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO order_statuses (status, label, description, "order") VALUES
      ('received', 'Order Received', 'Order has been received', 0),
      ('preparing', 'Preparing', 'Order is being prepared', 1),
      ('ready', 'Ready', 'Order is ready for pickup/delivery', 2),
      ('completed', 'Completed', 'Order has been completed', 3);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM order_statuses`);
  }
}

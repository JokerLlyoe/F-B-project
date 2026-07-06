import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddIndexes1704067200005 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE INDEX idx_orders_customer_phone ON orders("customerPhone")`);
    await queryRunner.query(`CREATE INDEX idx_orders_created_at ON orders("createdAt")`);
    await queryRunner.query(`CREATE INDEX idx_orders_status ON orders("statusId")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS idx_orders_customer_phone`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_orders_created_at`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_orders_status`);
  }
}

import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddStatusTransitions1704067200008 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add allowedTransitions column
    await queryRunner.query(`
      ALTER TABLE order_statuses
      ADD COLUMN "allowedTransitions" text DEFAULT '[]'
    `);

    // Update existing statuses with their allowed transitions
    await queryRunner.query(`
      UPDATE order_statuses
      SET "allowedTransitions" = '["preparing"]'
      WHERE status = 'received'
    `);

    await queryRunner.query(`
      UPDATE order_statuses
      SET "allowedTransitions" = '["ready"]'
      WHERE status = 'preparing'
    `);

    await queryRunner.query(`
      UPDATE order_statuses
      SET "allowedTransitions" = '["completed"]'
      WHERE status = 'ready'
    `);

    await queryRunner.query(`
      UPDATE order_statuses
      SET "allowedTransitions" = '[]'
      WHERE status = 'completed'
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE order_statuses
      DROP COLUMN "allowedTransitions"
    `);
  }
}

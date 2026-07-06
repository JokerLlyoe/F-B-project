import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddOrderItemsTimestamps1704067200010 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add missing timestamp columns to order_items table
    await queryRunner.query(`
      ALTER TABLE "order_items"
      ADD COLUMN IF NOT EXISTS "createdAt" timestamp DEFAULT CURRENT_TIMESTAMP
    `);

    await queryRunner.query(`
      ALTER TABLE "order_items"
      ADD COLUMN IF NOT EXISTS "updatedAt" timestamp DEFAULT CURRENT_TIMESTAMP
    `);

    // Update existing rows to have proper timestamps
    await queryRunner.query(`
      UPDATE "order_items"
      SET "createdAt" = NOW(), "updatedAt" = NOW()
      WHERE "createdAt" IS NULL OR "updatedAt" IS NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "order_items" DROP COLUMN IF EXISTS "createdAt"`);
    await queryRunner.query(`ALTER TABLE "order_items" DROP COLUMN IF EXISTS "updatedAt"`);
  }
}

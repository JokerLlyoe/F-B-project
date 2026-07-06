import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddBaseEntityFields1704067200009 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const tables = ['menu_items', 'menu_categories', 'orders', 'order_items', 'order_statuses'];

    for (const table of tables) {
      // Add createdBy column
      await queryRunner.query(`
        ALTER TABLE "${table}"
        ADD COLUMN IF NOT EXISTS "createdBy" uuid
      `);

      // Add updatedBy column
      await queryRunner.query(`
        ALTER TABLE "${table}"
        ADD COLUMN IF NOT EXISTS "updatedBy" uuid
      `);

      // Add rowVersion column
      await queryRunner.query(`
        ALTER TABLE "${table}"
        ADD COLUMN IF NOT EXISTS "rowVersion" int DEFAULT 0
      `);

      // Add isActive column
      await queryRunner.query(`
        ALTER TABLE "${table}"
        ADD COLUMN IF NOT EXISTS "isActive" boolean DEFAULT true
      `);
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const tables = ['menu_items', 'menu_categories', 'orders', 'order_items', 'order_statuses'];

    for (const table of tables) {
      await queryRunner.query(`ALTER TABLE "${table}" DROP COLUMN IF EXISTS "createdBy"`);
      await queryRunner.query(`ALTER TABLE "${table}" DROP COLUMN IF EXISTS "updatedBy"`);
      await queryRunner.query(`ALTER TABLE "${table}" DROP COLUMN IF EXISTS "rowVersion"`);
      await queryRunner.query(`ALTER TABLE "${table}" DROP COLUMN IF EXISTS "isActive"`);
    }
  }
}

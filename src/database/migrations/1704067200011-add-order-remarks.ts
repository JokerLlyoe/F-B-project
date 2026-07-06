import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddOrderRemarks1704067200011 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add remarks column to orders table
    await queryRunner.query(`
      ALTER TABLE "orders"
      ADD COLUMN IF NOT EXISTS "remarks" varchar(500)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN IF EXISTS "remarks"`);
  }
}

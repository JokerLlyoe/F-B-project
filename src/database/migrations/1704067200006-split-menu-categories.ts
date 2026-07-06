import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class SplitMenuCategories1704067200006 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create menu_categories table
    await queryRunner.createTable(
      new Table({
        name: 'menu_categories',
        columns: [
          {
            name: 'id',
            type: 'serial',
            isPrimary: true,
          },
          {
            name: 'name',
            type: 'varchar',
            isUnique: true,
          },
          {
            name: 'description',
            type: 'varchar',
            isNullable: true,
          },
          {
            name: 'displayOrder',
            type: 'int',
            default: 0,
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    // Insert default categories
    await queryRunner.query(`
      INSERT INTO menu_categories (name, description, "displayOrder") VALUES
      ('Appetizer', 'Starters and light bites', 0),
      ('Main Course', 'Main dishes and entrees', 1),
      ('Dessert', 'Sweet treats and desserts', 2),
      ('Beverage', 'Drinks and beverages', 3),
      ('Side Dish', 'Side dishes and accompaniments', 4)
    `);

    // Add stockCount column to menu_items
    await queryRunner.query(`
      ALTER TABLE "menu_items" ADD COLUMN "stockCount" int DEFAULT 0
    `);

    // Add categoryId column to menu_items
    await queryRunner.query(`
      ALTER TABLE "menu_items" ADD COLUMN "categoryId" int
    `);

    // Add foreign key constraint
    await queryRunner.createForeignKey(
      'menu_items',
      new TableForeignKey({
        columnNames: ['categoryId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'menu_categories',
        onDelete: 'RESTRICT',
      }),
    );

    // Update existing records to map to 'Main Course' category (id=2)
    await queryRunner.query(`
      UPDATE "menu_items" SET "categoryId" = 2 WHERE "categoryId" IS NULL
    `);

    // Make categoryId NOT NULL
    await queryRunner.query(`
      ALTER TABLE "menu_items" ALTER COLUMN "categoryId" SET NOT NULL
    `);

    // Drop old category column
    await queryRunner.query(`
      ALTER TABLE menu_items DROP COLUMN category
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Add back the old category column
    await queryRunner.query(`
      ALTER TABLE "menu_items" ADD COLUMN "category" varchar
    `);

    // Copy data back
    await queryRunner.query(`
      UPDATE "menu_items" SET "category" = 'Main Course' WHERE "categoryId" = 2
    `);

    // Make category NOT NULL
    await queryRunner.query(`
      ALTER TABLE "menu_items" ALTER COLUMN "category" SET NOT NULL
    `);

    // Drop foreign key
    await queryRunner.query(`
      ALTER TABLE "menu_items" DROP CONSTRAINT "FK_d56e5ccc298e8bf721f75a7eb96"
    `);

    // Drop categoryId column
    await queryRunner.query(`
      ALTER TABLE "menu_items" DROP COLUMN "categoryId"
    `);

    // Drop stockCount column
    await queryRunner.query(`
      ALTER TABLE "menu_items" DROP COLUMN "stockCount"
    `);

    // Drop menu_categories table
    await queryRunner.dropTable('menu_categories');
  }
}
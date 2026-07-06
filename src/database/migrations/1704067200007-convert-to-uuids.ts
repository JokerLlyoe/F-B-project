import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class ConvertToUuids1704067200007 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Enable UUID extension
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    // ponytail: Drop all foreign keys dynamically to avoid missing any constraints
    const tableNames = ['orders', 'order_items', 'menu_items'];

    for (const tableName of tableNames) {
      const constraints = await queryRunner.query(`
        SELECT constraint_name
        FROM information_schema.table_constraints
        WHERE table_schema = 'public'
        AND table_name = '${tableName}'
        AND constraint_type = 'FOREIGN KEY'
      `);

      for (const constraint of constraints) {
        await queryRunner.query(`ALTER TABLE "${tableName}" DROP CONSTRAINT IF EXISTS "${constraint.constraint_name}"`);
      }
    }

    // 2. Convert ALL primary key columns to UUID
    await queryRunner.query(`
      ALTER TABLE order_statuses
      ALTER COLUMN id DROP DEFAULT,
      ALTER COLUMN id TYPE uuid USING uuid_generate_v4(),
      ALTER COLUMN id SET DEFAULT uuid_generate_v4()
    `);

    await queryRunner.query(`
      ALTER TABLE menu_categories
      ALTER COLUMN id DROP DEFAULT,
      ALTER COLUMN id TYPE uuid USING uuid_generate_v4(),
      ALTER COLUMN id SET DEFAULT uuid_generate_v4()
    `);

    await queryRunner.query(`
      ALTER TABLE menu_items
      ALTER COLUMN id DROP DEFAULT,
      ALTER COLUMN id TYPE uuid USING uuid_generate_v4(),
      ALTER COLUMN id SET DEFAULT uuid_generate_v4()
    `);

    await queryRunner.query(`
      ALTER TABLE orders
      ALTER COLUMN id DROP DEFAULT,
      ALTER COLUMN id TYPE uuid USING uuid_generate_v4(),
      ALTER COLUMN id SET DEFAULT uuid_generate_v4()
    `);

    await queryRunner.query(`
      ALTER TABLE order_items
      ALTER COLUMN id DROP DEFAULT,
      ALTER COLUMN id TYPE uuid USING uuid_generate_v4(),
      ALTER COLUMN id SET DEFAULT uuid_generate_v4()
    `);

    // 3. Convert ALL foreign key columns to UUID (generate new UUIDs to match new PKs)
    await queryRunner.query(`
      ALTER TABLE menu_items
      ALTER COLUMN "categoryId" DROP NOT NULL,
      ALTER COLUMN "categoryId" TYPE uuid USING uuid_generate_v4(),
      ALTER COLUMN "categoryId" SET NOT NULL
    `);

    await queryRunner.query(`
      ALTER TABLE orders
      ALTER COLUMN "statusId" DROP NOT NULL,
      ALTER COLUMN "statusId" TYPE uuid USING uuid_generate_v4(),
      ALTER COLUMN "statusId" SET NOT NULL
    `);

    await queryRunner.query(`
      ALTER TABLE order_items
      ALTER COLUMN "orderId" DROP NOT NULL,
      ALTER COLUMN "orderId" TYPE uuid USING uuid_generate_v4(),
      ALTER COLUMN "orderId" SET NOT NULL
    `);

    await queryRunner.query(`
      ALTER TABLE order_items
      ALTER COLUMN "menuItemId" DROP NOT NULL,
      ALTER COLUMN "menuItemId" TYPE uuid USING uuid_generate_v4(),
      ALTER COLUMN "menuItemId" SET NOT NULL
    `);

    // 4. Clear existing data (relationships broken by UUID conversion)
    await queryRunner.query(`DELETE FROM order_items`);
    await queryRunner.query(`DELETE FROM orders`);
    await queryRunner.query(`DELETE FROM menu_items`);

    // 5. Recreate ALL foreign key constraints with UUID types
    await queryRunner.query(`
      ALTER TABLE orders
      ADD CONSTRAINT "FK_orders_statusId"
      FOREIGN KEY ("statusId")
      REFERENCES order_statuses(id)
    `);

    await queryRunner.query(`
      ALTER TABLE order_items
      ADD CONSTRAINT "FK_orderItems_orderId"
      FOREIGN KEY ("orderId")
      REFERENCES orders(id) ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE order_items
      ADD CONSTRAINT "FK_orderItems_menuItemId"
      FOREIGN KEY ("menuItemId")
      REFERENCES menu_items(id)
    `);

    await queryRunner.query(`
      ALTER TABLE menu_items
      ADD CONSTRAINT "FK_menuItems_categoryId"
      FOREIGN KEY ("categoryId")
      REFERENCES menu_categories(id)
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Reverse all changes - convert back to serial integers
    // Note: This will lose all existing data due to UUID → int conversion

    // Drop foreign keys
    await queryRunner.query(`ALTER TABLE menu_items DROP CONSTRAINT IF EXISTS "FK_menuItems_categoryId"`);
    await queryRunner.query(`ALTER TABLE order_items DROP CONSTRAINT IF EXISTS "FK_orderItems_menuItemId"`);
    await queryRunner.query(`ALTER TABLE order_items DROP CONSTRAINT IF EXISTS "FK_orderItems_orderId"`);
    await queryRunner.query(`ALTER TABLE orders DROP CONSTRAINT IF EXISTS "FK_orders_statusId"`);

    // Convert back to integer
    await queryRunner.query(`ALTER TABLE order_items ALTER COLUMN "menuItemId" TYPE int USING 0`);
    await queryRunner.query(`ALTER TABLE order_items ALTER COLUMN "orderId" TYPE int USING 0`);
    await queryRunner.query(`ALTER TABLE orders ALTER COLUMN "statusId" TYPE int USING 0`);
    await queryRunner.query(`ALTER TABLE menu_items ALTER COLUMN "categoryId" TYPE int USING 0`);

    await queryRunner.query(`ALTER TABLE order_items ALTER COLUMN id DROP DEFAULT`);
    await queryRunner.query(`ALTER TABLE order_items ALTER COLUMN id TYPE int USING 0`);
    await queryRunner.query(`ALTER TABLE orders ALTER COLUMN id DROP DEFAULT`);
    await queryRunner.query(`ALTER TABLE orders ALTER COLUMN id TYPE int USING 0`);
    await queryRunner.query(`ALTER TABLE menu_items ALTER COLUMN id DROP DEFAULT`);
    await queryRunner.query(`ALTER TABLE menu_items ALTER COLUMN id TYPE int USING 0`);
    await queryRunner.query(`ALTER TABLE menu_categories ALTER COLUMN id DROP DEFAULT`);
    await queryRunner.query(`ALTER TABLE menu_categories ALTER COLUMN id TYPE int USING 0`);
    await queryRunner.query(`ALTER TABLE order_statuses ALTER COLUMN id DROP DEFAULT`);
    await queryRunner.query(`ALTER TABLE order_statuses ALTER COLUMN id TYPE int USING 0`);

    // Recreate foreign keys with integer types
    await queryRunner.query(`ALTER TABLE orders ADD CONSTRAINT "FK_orders_statusId" FOREIGN KEY ("statusId") REFERENCES order_statuses(id)`);
    await queryRunner.query(`ALTER TABLE order_items ADD CONSTRAINT "FK_orderItems_orderId" FOREIGN KEY ("orderId") REFERENCES orders(id) ON DELETE CASCADE`);
    await queryRunner.query(`ALTER TABLE order_items ADD CONSTRAINT "FK_orderItems_menuItemId" FOREIGN KEY ("menuItemId") REFERENCES menu_items(id)`);
    await queryRunner.query(`ALTER TABLE menu_items ADD CONSTRAINT "FK_menuItems_categoryId" FOREIGN KEY ("categoryId") REFERENCES menu_categories(id)`);
  }
}

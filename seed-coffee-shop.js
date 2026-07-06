require('dotenv').config();
const { Client } = require('pg');
const Big = require('big.js');

async function seedCoffeeShop() {
  const client = new Client({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT) || 5432,
    database: process.env.DB_NAME || 'foodbeverage_system',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'admin'
  });

  try {
    console.log('🌱 Starting coffee shop seeding...\n');
    await client.connect();
    console.log('✅ Connected to database');

    // Clear existing menu data
    console.log('🧹 Clearing existing menu data...');
    await client.query('DELETE FROM order_items');
    await client.query('DELETE FROM orders');
    await client.query('DELETE FROM menu_items');
    await client.query('DELETE FROM menu_categories');
    console.log('✅ Cleared existing data');

    // Insert coffee shop categories
    console.log('\n📋 Creating coffee shop categories...');
    const categories = [
      { name: 'Milk Tea Series', description: 'Premium milk tea with various toppings and flavors', displayOrder: 0 },
      { name: 'Americano Series', description: 'Hot and iced americano with different roasts', displayOrder: 1 },
      { name: 'CEO Series', description: 'Signature drinks created by our head barista', displayOrder: 2 },
      { name: 'SOE Series', description: 'Single Origin Espresso - premium bean selections', displayOrder: 3 },
      { name: 'Pastries & Snacks', description: 'Fresh pastries and light snacks to complement your drink', displayOrder: 4 }
    ];

    const categoryMap = {};
    for (const category of categories) {
      const result = await client.query(
        `INSERT INTO menu_categories (name, description, "displayOrder", "createdAt", "updatedAt")
         VALUES ($1, $2, $3, NOW(), NOW())
         RETURNING id, name`,
        [category.name, category.description, category.displayOrder]
      );
      const key = category.name.toLowerCase().replace(/\s+/g, '_').replace('&', 'and');
      categoryMap[key] = result.rows[0].id;
      console.log(`   ✅ Created: ${category.name} (${result.rows[0].id})`);
    }

    // Coffee shop menu items
    const menuItems = [
      // Milk Tea Series
      {
        name: 'Classic Milk Tea',
        description: 'Our signature milk tea with premium Ceylon tea and fresh milk',
        price: 8.50,
        stockCount: 100,
        categoryId: categoryMap.milk_tea_series,
        imageUrl: 'https://example.com/classic-milk-tea.jpg',
        isAvailable: true
      },
      {
        name: 'Taro Milk Tea',
        description: 'Creamy taro milk tea with chewy pearls and whipped cream topping',
        price: 10.50,
        stockCount: 80,
        categoryId: categoryMap.milk_tea_series,
        imageUrl: 'https://example.com/taro-milk-tea.jpg',
        isAvailable: true
      },
      {
        name: 'Brown Sugar Milk Tea',
        description: 'Rich brown sugar fresh milk with caramelized sugar syrup',
        price: 9.50,
        stockCount: 90,
        categoryId: categoryMap.milk_tea_series,
        imageUrl: 'https://example.com/brown-sugar-milk-tea.jpg',
        isAvailable: true
      },
      {
        name: 'Matcha Milk Tea',
        description: 'Premium Japanese matcha blended with fresh milk and pearls',
        price: 11.00,
        stockCount: 70,
        categoryId: categoryMap.milk_tea_series,
        imageUrl: 'https://example.com/matcha-milk-tea.jpg',
        isAvailable: true
      },

      // Americano Series
      {
        name: 'Hot Americano',
        description: 'Classic hot americano made with our house blend espresso',
        price: 6.50,
        stockCount: 150,
        categoryId: categoryMap.americano_series,
        imageUrl: 'https://example.com/hot-americano.jpg',
        isAvailable: true
      },
      {
        name: 'Iced Americano',
        description: 'Refreshing iced americano with citrus notes and smooth finish',
        price: 7.00,
        stockCount: 150,
        categoryId: categoryMap.americano_series,
        imageUrl: 'https://example.com/iced-americano.jpg',
        isAvailable: true
      },
      {
        name: 'Americano with Milk',
        description: 'Classic americano with your choice of fresh milk or oat milk',
        price: 8.00,
        stockCount: 100,
        categoryId: categoryMap.americano_series,
        imageUrl: 'https://example.com/americano-milk.jpg',
        isAvailable: true
      },
      {
        name: 'Caramel Americano',
        description: 'Iced americano with rich caramel syrup and whipped cream',
        price: 9.50,
        stockCount: 80,
        categoryId: categoryMap.americano_series,
        imageUrl: 'https://example.com/caramel-americano.jpg',
        isAvailable: true
      },

      // CEO Series (Signature drinks)
      {
        name: 'CEO Signature Latte',
        description: 'Our CEO\'s creation - espresso with vanilla bean and Madagascar vanilla foam',
        price: 13.50,
        stockCount: 50,
        categoryId: categoryMap.ceo_series,
        imageUrl: 'https://example.com/ceo-latte.jpg',
        isAvailable: true
      },
      {
        name: 'Executive Mocha',
        description: 'Rich mocha with Belgian dark chocolate and house-made marshmallow',
        price: 14.00,
        stockCount: 40,
        categoryId: categoryMap.ceo_series,
        imageUrl: 'https://example.com/executive-mocha.jpg',
        isAvailable: true
      },
      {
        name: 'Boardroom Cold Brew',
        description: '24-hour cold brew infused with lavender and honey',
        price: 12.50,
        stockCount: 60,
        categoryId: categoryMap.ceo_series,
        imageUrl: 'https://example.com/boardroom-cold-brew.jpg',
        isAvailable: true
      },
      {
        name: 'Chairman\'s Espresso',
        description: 'Triple shot espresso with dark chocolate and orange zest notes',
        price: 11.50,
        stockCount: 45,
        categoryId: categoryMap.ceo_series,
        imageUrl: 'https://example.com/chairman-espresso.jpg',
        isAvailable: true
      },

      // SOE Series (Single Origin Espresso)
      {
        name: 'Ethiopian Yirgacheffe',
        description: 'Light roast with bright acidity, blueberry notes, and floral aroma',
        price: 15.00,
        stockCount: 30,
        categoryId: categoryMap.soe_series,
        imageUrl: 'https://example.com/ethiopian-yirgacheffe.jpg',
        isAvailable: true
      },
      {
        name: 'Colombian Huila',
        description: 'Medium roast with caramel sweetness, red apple, and nutty finish',
        price: 14.50,
        stockCount: 35,
        categoryId: categoryMap.soe_series,
        imageUrl: 'https://example.com/colombian-huila.jpg',
        isAvailable: true
      },
      {
        name: 'Sumatra Mandheling',
        description: 'Dark roast with earthy body, herbal notes, and lingering spiciness',
        price: 14.00,
        stockCount: 30,
        categoryId: categoryMap.soe_series,
        imageUrl: 'https://example.com/sumatra-mandheling.jpg',
        isAvailable: true
      },
      {
        name: 'Kenyan AA',
        description: 'Medium-dark roast with bold acidity, blackcurrant, and savoury notes',
        price: 15.50,
        stockCount: 25,
        categoryId: categoryMap.soe_series,
        imageUrl: 'https://example.com/kenyan-aa.jpg',
        isAvailable: true
      },

      // Pastries & Snacks
      {
        name: 'Butter Croissant',
        description: 'Classic French croissant with golden, flaky layers',
        price: 4.50,
        stockCount: 40,
        categoryId: categoryMap.pastries_and_snacks,
        imageUrl: 'https://example.com/butter-croissant.jpg',
        isAvailable: true
      },
      {
        name: 'Almond Croissant',
        description: 'Butter croissant filled with almond cream and topped with sliced almonds',
        price: 6.00,
        stockCount: 35,
        categoryId: categoryMap.pastries_and_snacks,
        imageUrl: 'https://example.com/almond-croissant.jpg',
        isAvailable: true
      },
      {
        name: 'Chocolate Chip Cookie',
        description: 'Warm, gooey chocolate chip cookie with sea salt finish',
        price: 3.50,
        stockCount: 60,
        categoryId: categoryMap.pastries_and_snacks,
        imageUrl: 'https://example.com/choc-chip-cookie.jpg',
        isAvailable: true
      },
      {
        name: 'Cheese Danish',
        description: 'Flaky pastry with sweet cheese filling and berry compote',
        price: 5.50,
        stockCount: 30,
        categoryId: categoryMap.pastries_and_snacks,
        imageUrl: 'https://example.com/cheese-danish.jpg',
        isAvailable: true
      }
    ];

    console.log('\n☕ Seeding coffee shop menu...');
    for (const item of menuItems) {
      const result = await client.query(
        `INSERT INTO menu_items (name, description, price, "stockCount", "categoryId", "imageUrl", "isAvailable", "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
         RETURNING id, name`,
        [item.name, item.description, item.price, item.stockCount, item.categoryId, item.imageUrl, item.isAvailable]
      );
      console.log(`   ✅ Created: ${result.rows[0].name} (${result.rows[0].id})`);
    }

    // Create coffee shop sample orders
    console.log('\n📦 Creating sample coffee orders...');

    const menuItemsResult = await client.query('SELECT id, name, price FROM menu_items WHERE "isAvailable" = true LIMIT 6');
    const sampleItems = menuItemsResult.rows;

    if (sampleItems.length >= 2) {
      const statusResult = await client.query("SELECT id FROM order_statuses WHERE status = 'received'");
      const receivedStatusId = statusResult.rows[0]?.id;

      if (receivedStatusId) {
        const price1 = Big(sampleItems[0].price);
        const price2 = Big(sampleItems[1].price);
        const price3 = Big(sampleItems[2].price);

        const orders = [
          {
            customerName: 'Sarah Chen',
            customerPhone: '0123456789',
            customerEmail: 'sarah.chen@example.com',
            totalAmount: price1.plus(price2).toString(),
            orderType: 'pickup',
            deliveryAddress: null,
            remarks: 'Less ice, please',
            statusId: receivedStatusId
          },
          {
            customerName: 'Michael Tan',
            customerPhone: '0987654321',
            customerEmail: 'michael.tan@example.com',
            totalAmount: price2.plus(price3).toString(),
            orderType: 'delivery',
            deliveryAddress: '456 Coffee Street, KL Eco City, 50000 Kuala Lumpur',
            remarks: 'Please call upon arrival',
            statusId: receivedStatusId
          },
          {
            customerName: 'Emma Lee',
            customerPhone: '0112233445',
            customerEmail: 'emma.lee@example.com',
            totalAmount: price1.toString(),
            orderType: 'pickup',
            deliveryAddress: null,
            remarks: null,
            statusId: receivedStatusId
          }
        ];

        for (const order of orders) {
          const orderResult = await client.query(
            `INSERT INTO orders ("customerName", "customerPhone", "customerEmail", "totalAmount", "orderType", "deliveryAddress", "remarks", "statusId", "createdAt", "updatedAt")
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
             RETURNING id, "customerName"`,
            [order.customerName, order.customerPhone, order.customerEmail, order.totalAmount, order.orderType, order.deliveryAddress, order.remarks, order.statusId]
          );
          const orderId = orderResult.rows[0].id;
          console.log(`   ✅ Created order: ${orderResult.rows[0].customerName} (${orderId})`);

          // Add order items
          const itemsToAdd = order.orderType === 'delivery' ? [sampleItems[1], sampleItems[2]] : [sampleItems[0]];
          for (const item of itemsToAdd) {
            const quantity = 1;
            const unitPrice = Big(item.price);
            const subtotal = unitPrice.times(quantity);
            await client.query(
              `INSERT INTO order_items ("orderId", "menuItemId", quantity, "unitPrice", subtotal, notes)
               VALUES ($1, $2, $3, $4, $5, NULL)`,
              [orderId, item.id, quantity, unitPrice.toString(), subtotal.toString()]
            );
          }
          console.log(`     📋 Added ${itemsToAdd.length} items to order`);
        }
      }
    }

    console.log('\n🎉 Coffee shop seeding completed successfully!\n');
    console.log('📊 Summary:');
    console.log(`   - Categories: ${categories.length}`);
    console.log(`   - Menu items: ${menuItems.length}`);
    console.log(`   - Sample orders: 3`);
    console.log('\n☕ Your coffee shop is ready for business!');

  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    process.exit(1);
  } finally {
    await client.end();
    console.log('\n✅ Database connection closed');
  }
}

seedCoffeeShop();

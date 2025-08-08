const { sequelize } = require('../config/database');
const { User, Category, FoodItem } = require('../models');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

async function setupDatabase() {
  try {
    console.log('🔄 Setting up database...');

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
      console.log('✅ Created uploads directory');
    }

    // Sync database
    await sequelize.sync({ force: true });
    console.log('✅ Database synchronized');

    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 12);
    const adminUser = await User.create({
      email: 'admin@foodplatform.com',
      phone: '+256700000000',
      firstName: 'Admin',
      lastName: 'User',
      password: adminPassword,
      role: 'admin',
      isVerified: true,
      isActive: true
    });
    console.log('✅ Admin user created');

    // Create sample categories
    const categories = await Category.bulkCreate([
      {
        name: 'Breakfast',
        description: 'Start your day with delicious breakfast items',
        sortOrder: 1
      },
      {
        name: 'Lunch',
        description: 'Hearty lunch options for midday meals',
        sortOrder: 2
      },
      {
        name: 'Dinner',
        description: 'Delicious dinner options for evening meals',
        sortOrder: 3
      },
      {
        name: 'Snacks',
        description: 'Quick bites and light snacks',
        sortOrder: 4
      },
      {
        name: 'Beverages',
        description: 'Refreshing drinks and beverages',
        sortOrder: 5
      },
      {
        name: 'Desserts',
        description: 'Sweet treats and desserts',
        sortOrder: 6
      }
    ]);
    console.log('✅ Sample categories created');

    // Create sample food items
    const foodItems = await FoodItem.bulkCreate([
      {
        name: 'Full English Breakfast',
        description: 'Traditional English breakfast with eggs, bacon, sausages, beans, and toast',
        price: 15000,
        categoryId: categories[0].id,
        preparationTime: 20,
        calories: 800,
        isAvailable: true,
        isFeatured: true,
        allergens: ['eggs', 'gluten'],
        ingredients: ['eggs', 'bacon', 'sausages', 'baked beans', 'toast', 'butter'],
        tags: ['breakfast', 'traditional', 'hearty']
      },
      {
        name: 'Pancakes with Maple Syrup',
        description: 'Fluffy pancakes served with maple syrup and butter',
        price: 8000,
        categoryId: categories[0].id,
        preparationTime: 15,
        calories: 450,
        isAvailable: true,
        isFeatured: false,
        allergens: ['gluten', 'dairy'],
        ingredients: ['flour', 'eggs', 'milk', 'butter', 'maple syrup'],
        tags: ['breakfast', 'sweet', 'pancakes']
      },
      {
        name: 'Grilled Chicken Salad',
        description: 'Fresh mixed greens with grilled chicken breast, tomatoes, and vinaigrette',
        price: 12000,
        categoryId: categories[1].id,
        preparationTime: 25,
        calories: 350,
        isAvailable: true,
        isFeatured: true,
        allergens: ['nuts'],
        ingredients: ['chicken breast', 'mixed greens', 'tomatoes', 'cucumber', 'olive oil'],
        tags: ['lunch', 'healthy', 'salad']
      },
      {
        name: 'Beef Burger',
        description: 'Juicy beef burger with lettuce, tomato, cheese, and special sauce',
        price: 18000,
        categoryId: categories[1].id,
        preparationTime: 20,
        calories: 650,
        isAvailable: true,
        isFeatured: true,
        allergens: ['gluten', 'dairy'],
        ingredients: ['beef patty', 'burger bun', 'lettuce', 'tomato', 'cheese', 'sauce'],
        tags: ['lunch', 'burger', 'fast-food']
      },
      {
        name: 'Spaghetti Carbonara',
        description: 'Classic Italian pasta with eggs, cheese, pancetta, and black pepper',
        price: 16000,
        categoryId: categories[2].id,
        preparationTime: 30,
        calories: 550,
        isAvailable: true,
        isFeatured: false,
        allergens: ['gluten', 'eggs', 'dairy'],
        ingredients: ['spaghetti', 'eggs', 'pecorino cheese', 'pancetta', 'black pepper'],
        tags: ['dinner', 'pasta', 'italian']
      },
      {
        name: 'Grilled Salmon',
        description: 'Fresh salmon fillet grilled to perfection with herbs and lemon',
        price: 25000,
        categoryId: categories[2].id,
        preparationTime: 25,
        calories: 400,
        isAvailable: true,
        isFeatured: true,
        allergens: ['fish'],
        ingredients: ['salmon fillet', 'lemon', 'herbs', 'olive oil', 'salt', 'pepper'],
        tags: ['dinner', 'seafood', 'healthy']
      },
      {
        name: 'French Fries',
        description: 'Crispy golden fries served with ketchup',
        price: 5000,
        categoryId: categories[3].id,
        preparationTime: 15,
        calories: 300,
        isAvailable: true,
        isFeatured: false,
        allergens: [],
        ingredients: ['potatoes', 'oil', 'salt'],
        tags: ['snacks', 'fries', 'fast-food']
      },
      {
        name: 'Chicken Wings',
        description: 'Crispy chicken wings with your choice of sauce',
        price: 12000,
        categoryId: categories[3].id,
        preparationTime: 20,
        calories: 450,
        isAvailable: true,
        isFeatured: true,
        allergens: ['gluten'],
        ingredients: ['chicken wings', 'flour', 'spices', 'sauce'],
        tags: ['snacks', 'wings', 'spicy']
      },
      {
        name: 'Fresh Orange Juice',
        description: 'Freshly squeezed orange juice',
        price: 3000,
        categoryId: categories[4].id,
        preparationTime: 5,
        calories: 120,
        isAvailable: true,
        isFeatured: false,
        allergens: [],
        ingredients: ['oranges'],
        tags: ['beverages', 'juice', 'fresh']
      },
      {
        name: 'Coffee',
        description: 'Hot brewed coffee',
        price: 2000,
        categoryId: categories[4].id,
        preparationTime: 3,
        calories: 5,
        isAvailable: true,
        isFeatured: false,
        allergens: [],
        ingredients: ['coffee beans', 'water'],
        tags: ['beverages', 'coffee', 'hot']
      },
      {
        name: 'Chocolate Cake',
        description: 'Rich chocolate cake with chocolate frosting',
        price: 8000,
        categoryId: categories[5].id,
        preparationTime: 10,
        calories: 350,
        isAvailable: true,
        isFeatured: true,
        allergens: ['gluten', 'dairy', 'eggs'],
        ingredients: ['flour', 'cocoa', 'sugar', 'eggs', 'butter', 'milk'],
        tags: ['desserts', 'chocolate', 'cake']
      },
      {
        name: 'Ice Cream',
        description: 'Vanilla ice cream with your choice of toppings',
        price: 4000,
        categoryId: categories[5].id,
        preparationTime: 2,
        calories: 200,
        isAvailable: true,
        isFeatured: false,
        allergens: ['dairy'],
        ingredients: ['milk', 'cream', 'sugar', 'vanilla'],
        tags: ['desserts', 'ice-cream', 'cold']
      }
    ]);
    console.log('✅ Sample food items created');

    // Create sample customer user
    const customerPassword = await bcrypt.hash('customer123', 12);
    const customerUser = await User.create({
      email: 'customer@example.com',
      phone: '+256700000001',
      firstName: 'John',
      lastName: 'Doe',
      password: customerPassword,
      role: 'customer',
      isVerified: true,
      isActive: true
    });
    console.log('✅ Sample customer user created');

    console.log('\n🎉 Database setup completed successfully!');
    console.log('\n📋 Sample Data:');
    console.log(`- Admin User: admin@foodplatform.com / admin123`);
    console.log(`- Customer User: customer@example.com / customer123`);
    console.log(`- Categories: ${categories.length} created`);
    console.log(`- Food Items: ${foodItems.length} created`);
    console.log('\n🚀 You can now start the server with: npm run dev');

  } catch (error) {
    console.error('❌ Database setup failed:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

// Run setup if this file is executed directly
if (require.main === module) {
  setupDatabase();
}

module.exports = setupDatabase; 
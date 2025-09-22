import { db } from './database';

export const initializeDatabase = async () => {
  try {
    // Create tables if they don't exist
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL CHECK (role IN ('customer', 'employee')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS products (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        image VARCHAR(500) NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS shopping_lists (
        id VARCHAR(255) PRIMARY KEY,
        customer_id VARCHAR(255) NOT NULL,
        customer_name VARCHAR(255) NOT NULL,
        status VARCHAR(50) NOT NULL CHECK (status IN ('pending', 'in_progress', 'completed')),
        assigned_employee_id VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (customer_id) REFERENCES users(id),
        FOREIGN KEY (assigned_employee_id) REFERENCES users(id)
      );
    `);

    await db.query(`
      CREATE TABLE IF NOT EXISTS shopping_list_items (
        id VARCHAR(255) PRIMARY KEY,
        shopping_list_id VARCHAR(255) NOT NULL,
        product_id VARCHAR(255) NOT NULL,
        quantity INTEGER NOT NULL CHECK (quantity > 0),
        status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'collected', 'unavailable')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (shopping_list_id) REFERENCES shopping_lists(id) ON DELETE CASCADE,
        FOREIGN KEY (product_id) REFERENCES products(id)
      );
    `);

    // Create indexes for better performance
    await db.query(`
      CREATE INDEX IF NOT EXISTS idx_shopping_lists_customer_id ON shopping_lists(customer_id);
    `);

    await db.query(`
      CREATE INDEX IF NOT EXISTS idx_shopping_lists_assigned_employee_id ON shopping_lists(assigned_employee_id);
    `);

    await db.query(`
      CREATE INDEX IF NOT EXISTS idx_shopping_list_items_shopping_list_id ON shopping_list_items(shopping_list_id);
    `);

    console.log('Database initialized successfully');
    return true;
  } catch (error) {
    console.error('Error initializing database:', error);
    return false;
  }
};

export const seedDatabase = async () => {
  try {
    // Insert default users
    await db.query(`
      INSERT INTO users (id, name, role) VALUES 
      ('1', 'John Customer', 'customer'),
      ('2', 'Jane Employee', 'employee'),
      ('3', 'Bob Customer', 'customer')
      ON CONFLICT (id) DO NOTHING;
    `);

    // Insert products
    const products = [
      { id: '1', name: 'Fresh Milk', image: '/images/milk.jpg', price: 1.50 },
      { id: '2', name: 'White Bread', image: '/images/bread.jpg', price: 0.90 },
      { id: '3', name: 'Bananas', image: '/images/bananas.jpg', price: 1.20 },
      { id: '4', name: 'Chicken Breast', image: '/images/chicken.jpg', price: 5.99 },
      { id: '5', name: 'Tomatoes', image: '/images/tomatoes.jpg', price: 2.30 },
      { id: '6', name: 'Orange Juice', image: '/images/orange-juice.jpg', price: 2.80 },
      { id: '7', name: 'Pasta', image: '/images/pasta.jpg', price: 1.10 },
      { id: '8', name: 'Ground Beef', image: '/images/beef.jpg', price: 7.50 },
      { id: '9', name: 'Apples', image: '/images/apples.jpg', price: 2.00 },
      { id: '10', name: 'Cheese', image: '/images/cheese.jpg', price: 3.50 },
    ];

    for (const product of products) {
      await db.query(`
        INSERT INTO products (id, name, image, price) VALUES ($1, $2, $3, $4)
        ON CONFLICT (id) DO UPDATE SET 
        name = EXCLUDED.name,
        image = EXCLUDED.image,
        price = EXCLUDED.price;
      `, [product.id, product.name, product.image, product.price]);
    }

    console.log('Database seeded successfully');
    return true;
  } catch (error) {
    console.error('Error seeding database:', error);
    return false;
  }
};

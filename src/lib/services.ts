import { db } from './database';
import { Product, ShoppingList, ShoppingListItem, User } from '../types';

// User operations
export const userService = {
  async getById(id: string): Promise<User | null> {
    try {
      const result = await db.query('SELECT * FROM users WHERE id = $1', [id]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error getting user by id:', error);
      return null;
    }
  },

  async getByRole(role: 'customer' | 'employee'): Promise<User[]> {
    try {
      const result = await db.query('SELECT * FROM users WHERE role = $1', [role]);
      return result.rows;
    } catch (error) {
      console.error('Error getting users by role:', error);
      return [];
    }
  },

  async create(user: User): Promise<boolean> {
    try {
      await db.query(
        'INSERT INTO users (id, name, role) VALUES ($1, $2, $3)',
        [user.id, user.name, user.role]
      );
      return true;
    } catch (error) {
      console.error('Error creating user:', error);
      return false;
    }
  }
};

// Product operations
export const productService = {
  async getAll(): Promise<Product[]> {
    try {
      const result = await db.query('SELECT * FROM products ORDER BY name');
      return result.rows.map(row => ({
        id: row.id,
        name: row.name,
        image: row.image,
        price: parseFloat(row.price) // Convert string to number
      }));
    } catch (error) {
      console.error('Error getting products:', error);
      return [];
    }
  },

  async getById(id: string): Promise<Product | null> {
    try {
      const result = await db.query('SELECT * FROM products WHERE id = $1', [id]);
      if (result.rows[0]) {
        const row = result.rows[0];
        return {
          id: row.id,
          name: row.name,
          image: row.image,
          price: parseFloat(row.price) // Convert string to number
        };
      }
      return null;
    } catch (error) {
      console.error('Error getting product by id:', error);
      return null;
    }
  }
};

// Shopping list operations
export const shoppingListService = {
  async getAll(): Promise<ShoppingList[]> {
    try {
      const listsResult = await db.query(`
        SELECT sl.*, u.name as customer_name 
        FROM shopping_lists sl 
        JOIN users u ON sl.customer_id = u.id 
        ORDER BY sl.created_at DESC
      `);

      const lists: ShoppingList[] = [];
      
      for (const listRow of listsResult.rows) {
        const items = await this.getListItems(listRow.id);
        lists.push({
          id: listRow.id,
          customerId: listRow.customer_id,
          customerName: listRow.customer_name,
          status: listRow.status,
          createdAt: listRow.created_at.toISOString(),
          assignedEmployeeId: listRow.assigned_employee_id,
          items
        });
      }

      return lists;
    } catch (error) {
      console.error('Error getting shopping lists:', error);
      return [];
    }
  },

  async getByCustomerId(customerId: string): Promise<ShoppingList[]> {
    try {
      const listsResult = await db.query(`
        SELECT sl.*, u.name as customer_name 
        FROM shopping_lists sl 
        JOIN users u ON sl.customer_id = u.id 
        WHERE sl.customer_id = $1 
        ORDER BY sl.created_at DESC
      `, [customerId]);

      const lists: ShoppingList[] = [];
      
      for (const listRow of listsResult.rows) {
        const items = await this.getListItems(listRow.id);
        lists.push({
          id: listRow.id,
          customerId: listRow.customer_id,
          customerName: listRow.customer_name,
          status: listRow.status,
          createdAt: listRow.created_at.toISOString(),
          assignedEmployeeId: listRow.assigned_employee_id,
          items
        });
      }

      return lists;
    } catch (error) {
      console.error('Error getting shopping lists by customer:', error);
      return [];
    }
  },

  async getByEmployeeId(employeeId: string): Promise<ShoppingList[]> {
    try {
      const listsResult = await db.query(`
        SELECT sl.*, u.name as customer_name 
        FROM shopping_lists sl 
        JOIN users u ON sl.customer_id = u.id 
        WHERE sl.assigned_employee_id = $1 
        ORDER BY sl.created_at DESC
      `, [employeeId]);

      const lists: ShoppingList[] = [];
      
      for (const listRow of listsResult.rows) {
        const items = await this.getListItems(listRow.id);
        lists.push({
          id: listRow.id,
          customerId: listRow.customer_id,
          customerName: listRow.customer_name,
          status: listRow.status,
          createdAt: listRow.created_at.toISOString(),
          assignedEmployeeId: listRow.assigned_employee_id,
          items
        });
      }

      return lists;
    } catch (error) {
      console.error('Error getting shopping lists by employee:', error);
      return [];
    }
  },

  async getListItems(listId: string): Promise<ShoppingListItem[]> {
    try {
      const result = await db.query(`
        SELECT sli.*, p.name as product_name, p.image as product_image, p.price as product_price
        FROM shopping_list_items sli
        JOIN products p ON sli.product_id = p.id
        WHERE sli.shopping_list_id = $1
        ORDER BY sli.created_at
      `, [listId]);

      return result.rows.map(row => ({
        id: row.id,
        productId: row.product_id,
        product: {
          id: row.product_id,
          name: row.product_name,
          image: row.product_image,
          price: parseFloat(row.product_price) // Convert string to number
        },
        quantity: row.quantity,
        status: row.status
      }));
    } catch (error) {
      console.error('Error getting list items:', error);
      return [];
    }
  },

  async create(shoppingList: ShoppingList): Promise<boolean> {
    const client = await db.getClient();
    try {
      await client.query('BEGIN');

      // Insert shopping list
      await client.query(`
        INSERT INTO shopping_lists (id, customer_id, customer_name, status, assigned_employee_id, created_at)
        VALUES ($1, $2, $3, $4, $5, $6)
      `, [
        shoppingList.id,
        shoppingList.customerId,
        shoppingList.customerName,
        shoppingList.status,
        shoppingList.assignedEmployeeId,
        shoppingList.createdAt
      ]);

      // Insert shopping list items
      for (const item of shoppingList.items) {
        await client.query(`
          INSERT INTO shopping_list_items (id, shopping_list_id, product_id, quantity, status)
          VALUES ($1, $2, $3, $4, $5)
        `, [item.id, shoppingList.id, item.productId, item.quantity, item.status]);
      }

      await client.query('COMMIT');
      return true;
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error creating shopping list:', error);
      return false;
    } finally {
      client.release();
    }
  },

  async updateStatus(listId: string, status: 'pending' | 'in_progress' | 'completed'): Promise<boolean> {
    try {
      await db.query(`
        UPDATE shopping_lists 
        SET status = $1, updated_at = CURRENT_TIMESTAMP 
        WHERE id = $2
      `, [status, listId]);
      return true;
    } catch (error) {
      console.error('Error updating shopping list status:', error);
      return false;
    }
  },

  async updateItemStatus(listId: string, itemId: string, status: 'pending' | 'collected' | 'unavailable'): Promise<boolean> {
    const client = await db.getClient();
    try {
      await client.query('BEGIN');

      // Update item status
      await client.query(`
        UPDATE shopping_list_items 
        SET status = $1, updated_at = CURRENT_TIMESTAMP 
        WHERE id = $2 AND shopping_list_id = $3
      `, [status, itemId, listId]);

      // Update list status to in_progress if not already completed
      await client.query(`
        UPDATE shopping_lists 
        SET status = 'in_progress', updated_at = CURRENT_TIMESTAMP 
        WHERE id = $1 AND status = 'pending'
      `, [listId]);

      await client.query('COMMIT');
      return true;
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error updating item status:', error);
      return false;
    } finally {
      client.release();
    }
  }
};

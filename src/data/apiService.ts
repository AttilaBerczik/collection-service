import { Product, ShoppingList, User } from '../types';

// API service to replace localStorage functionality
export const apiService = {
  // User operations
  async getUsers(role?: 'customer' | 'employee'): Promise<User[]> {
    const params = role ? `?role=${role}` : '';
    const response = await fetch(`/api/users${params}`);
    if (!response.ok) throw new Error('Failed to fetch users');
    return response.json();
  },

  async getUser(id: string): Promise<User | null> {
    const response = await fetch(`/api/users?id=${id}`);
    if (!response.ok) return null;
    return response.json();
  },

  // Product operations
  async getProducts(): Promise<Product[]> {
    const response = await fetch('/api/products');
    if (!response.ok) throw new Error('Failed to fetch products');
    return response.json();
  },

  // Shopping list operations
  async getShoppingLists(customerId?: string, employeeId?: string): Promise<ShoppingList[]> {
    let params = '';
    if (customerId) params = `?customerId=${customerId}`;
    else if (employeeId) params = `?employeeId=${employeeId}`;
    
    const response = await fetch(`/api/shopping-lists${params}`);
    if (!response.ok) throw new Error('Failed to fetch shopping lists');
    return response.json();
  },

  async createShoppingList(shoppingList: ShoppingList): Promise<boolean> {
    const response = await fetch('/api/shopping-lists', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(shoppingList),
    });
    return response.ok;
  },

  async updateItemStatus(listId: string, itemId: string, status: 'collected' | 'unavailable'): Promise<boolean> {
    const response = await fetch(`/api/shopping-lists/${listId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'updateItemStatus', itemId, status }),
    });
    return response.ok;
  },

  async updateListStatus(listId: string, status: 'pending' | 'in_progress' | 'completed'): Promise<boolean> {
    const response = await fetch(`/api/shopping-lists/${listId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'updateStatus', status }),
    });
    return response.ok;
  },

  async initializeDatabase(): Promise<boolean> {
    const response = await fetch('/api/setup', {
      method: 'POST',
    });
    return response.ok;
  }
};

// User session management (still using localStorage for login state)
export const getCurrentUser = (): User | null => {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem('currentUser');
  return stored ? JSON.parse(stored) : null;
};

export const setCurrentUser = (user: User) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('currentUser', JSON.stringify(user));
};

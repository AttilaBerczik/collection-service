import { Product, ShoppingList, User, ShoppingListItem } from '../types';

export const mockProducts: Product[] = [
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

export const mockUsers: User[] = [
  { id: '1', name: 'John Customer', role: 'customer' },
  { id: '2', name: 'Jane Employee', role: 'employee' },
  { id: '3', name: 'Bob Customer', role: 'customer' },
];

export const mockShoppingLists: ShoppingList[] = [
  {
    id: '1',
    customerId: '1',
    customerName: 'John Customer',
    status: 'pending',
    createdAt: '2025-09-21T10:00:00Z',
    assignedEmployeeId: '2',
    items: [
      { id: '1', productId: '1', product: mockProducts[0], quantity: 2, status: 'pending' },
      { id: '2', productId: '3', product: mockProducts[2], quantity: 1, status: 'pending' },
      { id: '3', productId: '4', product: mockProducts[3], quantity: 1, status: 'pending' },
    ]
  },
  {
    id: '2',
    customerId: '3',
    customerName: 'Bob Customer',
    status: 'pending',
    createdAt: '2025-09-21T11:30:00Z',
    assignedEmployeeId: '2',
    items: [
      { id: '4', productId: '2', product: mockProducts[1], quantity: 2, status: 'pending' },
      { id: '5', productId: '5', product: mockProducts[4], quantity: 3, status: 'pending' },
      { id: '6', productId: '6', product: mockProducts[5], quantity: 1, status: 'pending' },
      { id: '7', productId: '7', product: mockProducts[6], quantity: 2, status: 'pending' },
    ]
  }
];

// Local storage helpers
export const getShoppingLists = (): ShoppingList[] => {
  if (typeof window === 'undefined') return mockShoppingLists;
  const stored = localStorage.getItem('shoppingLists');
  return stored ? JSON.parse(stored) : mockShoppingLists;
};

export const saveShoppingLists = (lists: ShoppingList[]) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('shoppingLists', JSON.stringify(lists));
};

export const getCurrentUser = (): User | null => {
  if (typeof window === 'undefined') return null;
  const stored = localStorage.getItem('currentUser');
  return stored ? JSON.parse(stored) : null;
};

export const setCurrentUser = (user: User) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('currentUser', JSON.stringify(user));
};

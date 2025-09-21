export interface Product {
  id: string;
  name: string;
  image: string;
  price: number;
}

export interface ShoppingListItem {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  status: 'pending' | 'collected' | 'unavailable';
}

export interface ShoppingList {
  id: string;
  customerId: string;
  customerName: string;
  items: ShoppingListItem[];
  status: 'pending' | 'in_progress' | 'completed';
  createdAt: string;
  assignedEmployeeId?: string;
}

export interface User {
  id: string;
  name: string;
  role: 'customer' | 'employee';
}

'use client';

import { useState, useEffect } from 'react';
import { Product, ShoppingList, ShoppingListItem, User } from '../types';
import { apiService } from '../data/apiService';
import LoadingSpinner, { LoadingOverlay } from './LoadingSpinner';

interface CustomerDashboardProps {
  user: User;
  onLogout: () => void;
}

export default function CustomerDashboard({ user, onLogout }: CustomerDashboardProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<{ [productId: string]: number }>({});
  const [myLists, setMyLists] = useState<ShoppingList[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingList, setIsCreatingList] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    loadData();
  }, [user.id]);

  const loadData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      const [productsData, listsData] = await Promise.all([
        apiService.getProducts(),
        apiService.getShoppingLists(user.id)
      ]);
      setProducts(productsData);
      setMyLists(listsData);
    } catch (error) {
      console.error('Error loading data:', error);
      alert('Failed to load data. Please try again.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const updateQuantity = (productId: string, quantity: number) => {
    setCart(prev => ({
      ...prev,
      [productId]: Math.max(0, quantity)
    }));
  };

  const createShoppingList = async () => {
    const items: ShoppingListItem[] = Object.entries(cart)
      .filter(([_, quantity]) => quantity > 0)
      .map(([productId, quantity], index) => {
        const product = products.find(p => p.id === productId)!;
        return {
          id: `item-${Date.now()}-${index}`,
          productId,
          product,
          quantity,
          status: 'pending' as const
        };
      });

    if (items.length === 0) {
      alert('Please add items to your cart first');
      return;
    }

    const newList: ShoppingList = {
      id: `list-${Date.now()}`,
      customerId: user.id,
      customerName: user.name,
      items,
      status: 'pending',
      createdAt: new Date().toISOString(),
      assignedEmployeeId: '2' // Assign to Jane Employee
    };

    try {
      setIsCreatingList(true);
      const success = await apiService.createShoppingList(newList);
      if (success) {
        setCart({});
        await loadData(true); // Reload as refresh
        alert('Shopping list created successfully!');
      } else {
        alert('Failed to create shopping list. Please try again.');
      }
    } catch (error) {
      console.error('Error creating shopping list:', error);
      alert('Failed to create shopping list. Please try again.');
    } finally {
      setIsCreatingList(false);
    }
  };

  const getTotalItems = (list: ShoppingList) => {
    return list.items.reduce((sum, item) => sum + item.quantity, 0);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Show initial loading with spinner overlay instead of black screen
  if (isLoading && products.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <h1 className="text-3xl font-bold text-gray-900">Spar - Customer</h1>
              <div className="flex items-center space-x-4">
                <span className="text-gray-600">Welcome, {user.name}</span>
                <button
                  onClick={onLogout}
                  className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center min-h-96">
            <div className="text-center">
              <LoadingSpinner size="lg" className="text-blue-500 mb-4" />
              <p className="text-gray-600">Loading your dashboard...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 relative">
      {/* Loading overlays for actions */}
      <LoadingOverlay isVisible={isCreatingList} message="Creating shopping list..." />

      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <h1 className="text-3xl font-bold text-gray-900">Spar - Customer</h1>
              {isRefreshing && <LoadingSpinner size="sm" className="text-blue-500" />}
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">Welcome, {user.name}</span>
              <button
                onClick={onLogout}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Product Selection */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Select Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {products.map(product => (
                <div key={product.id} className="bg-white rounded-lg shadow-md p-4 transition-all duration-200 hover:shadow-lg hover:-translate-y-1">
                  <div className="w-full h-32 bg-gray-200 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                      <img
                          src={product.image}
                          alt={product.name}
                          className="w-full h-32 object-cover rounded-lg transition-transform duration-200 hover:scale-105"
                      />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{product.name}</h3>
                  <p className="text-green-600 font-bold mb-3">€{product.price.toFixed(2)}</p>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => updateQuantity(product.id, (cart[product.id] || 0) - 1)}
                      className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors duration-150"
                    >
                      -
                    </button>
                    <span className="w-8 text-center text-gray-800 font-medium">{cart[product.id] || 0}</span>
                    <button
                      onClick={() => updateQuantity(product.id, (cart[product.id] || 0) + 1)}
                      className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors duration-150"
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cart and My Lists */}
          <div className="space-y-8">
            {/* Current Cart */}
            <div className="bg-white rounded-lg shadow-md p-6 transition-all duration-200">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Current Cart</h3>
              {Object.entries(cart).filter(([_, quantity]) => quantity > 0).length === 0 ? (
                <p className="text-gray-500">No items in cart</p>
              ) : (
                <div className="space-y-2 mb-4">
                  {Object.entries(cart)
                    .filter(([_, quantity]) => quantity > 0)
                    .map(([productId, quantity]) => {
                      const product = products.find(p => p.id === productId)!;
                      return (
                        <div key={productId} className="flex justify-between items-center p-2 bg-gray-50 rounded transition-all duration-150">
                          <span className="text-sm text-gray-800">{product.name}</span>
                          <span className="text-sm font-semibold text-gray-800">{quantity}x</span>
                        </div>
                      );
                    })}
                </div>
              )}
              <button
                onClick={createShoppingList}
                disabled={isCreatingList || Object.entries(cart).filter(([_, quantity]) => quantity > 0).length === 0}
                className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isCreatingList ? (
                  <>
                    <LoadingSpinner size="sm" className="text-white" />
                    <span>Creating...</span>
                  </>
                ) : (
                  <span>Create Shopping List</span>
                )}
              </button>
            </div>

            {/* My Shopping Lists */}
            <div className="bg-white rounded-lg shadow-md p-6 transition-all duration-200">
              <h3 className="text-xl font-bold text-gray-900 mb-4">My Shopping Lists</h3>
              {myLists.length === 0 ? (
                <p className="text-gray-500">No shopping lists yet</p>
              ) : (
                <div className="space-y-3">
                  {myLists.map(list => (
                    <div key={list.id} className="border rounded-lg p-3 transition-all duration-150 hover:shadow-md hover:border-blue-300">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-semibold text-gray-900">List #{list.id.slice(-6)}</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium transition-all duration-150 ${getStatusColor(list.status)}`}>
                          {list.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-800">{getTotalItems(list)} items</p>
                      <p className="text-xs text-gray-600">{new Date(list.createdAt).toLocaleDateString()}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

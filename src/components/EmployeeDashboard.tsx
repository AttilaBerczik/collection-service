'use client';

import { useState, useEffect } from 'react';
import { ShoppingList, User } from '../types';
import { getShoppingLists, saveShoppingLists } from '../data/mockData';

interface EmployeeDashboardProps {
  user: User;
  onLogout: () => void;
}

export default function EmployeeDashboard({ user, onLogout }: EmployeeDashboardProps) {
  const [assignedLists, setAssignedLists] = useState<ShoppingList[]>([]);
  const [selectedList, setSelectedList] = useState<ShoppingList | null>(null);
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const updateOnlineStatus = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    
    loadAssignedLists();
    
    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, [user.id]);

  const loadAssignedLists = () => {
    const lists = getShoppingLists().filter(list => 
      list.assignedEmployeeId === user.id && list.status !== 'completed'
    );
    setAssignedLists(lists);
  };

  const updateItemStatus = (listId: string, itemId: string, status: 'collected' | 'unavailable') => {
    const allLists = getShoppingLists();
    const updatedLists = allLists.map(list => {
      if (list.id === listId) {
        const updatedItems = list.items.map(item => 
          item.id === itemId ? { ...item, status } : item
        );
        const updatedList = { 
          ...list, 
          items: updatedItems,
          status: 'in_progress' as const
        };
        
        // Update selected list if it's the current one
        if (selectedList?.id === listId) {
          setSelectedList(updatedList);
        }
        
        return updatedList;
      }
      return list;
    });
    
    saveShoppingLists(updatedLists);
    loadAssignedLists();
  };

  const completeList = (listId: string) => {
    const allLists = getShoppingLists();
    const updatedLists = allLists.map(list => 
      list.id === listId ? { ...list, status: 'completed' as const } : list
    );
    
    saveShoppingLists(updatedLists);
    loadAssignedLists();
    setSelectedList(null);
    
    // Simulate sending to payment engine
    alert('List completed and sent to payment system!');
  };

  const getTotalItems = (list: ShoppingList) => {
    return list.items.reduce((sum, item) => sum + item.quantity, 0);
  };

  const getCollectedItems = (list: ShoppingList) => {
    return list.items.filter(item => item.status === 'collected').length;
  };

  const getUnavailableItems = (list: ShoppingList) => {
    return list.items.filter(item => item.status === 'unavailable').length;
  };

  const isListComplete = (list: ShoppingList) => {
    return list.items.every(item => item.status !== 'pending');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getItemStatusIcon = (status: string) => {
    switch (status) {
      case 'collected': return '✅';
      case 'unavailable': return '❌';
      default: return '⏳';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <h1 className="text-3xl font-bold text-gray-900">Spar - Employee</h1>
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                isOnline ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {isOnline ? 'Online' : 'Offline'}
              </div>
            </div>
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Shopping Lists */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Assigned Shopping Lists</h2>
            {assignedLists.length === 0 ? (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <p className="text-gray-500">No shopping lists assigned</p>
              </div>
            ) : (
              <div className="space-y-4">
                {assignedLists.map(list => (
                  <div 
                    key={list.id} 
                    className={`bg-white rounded-lg shadow-md p-6 cursor-pointer transition-colors ${
                      selectedList?.id === list.id ? 'ring-2 ring-blue-500' : 'hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedList(list)}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-bold text-lg text-gray-900">List #{list.id.slice(-6)}</h3>
                        <p className="text-gray-700">{list.customerName}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(list.status)}`}>
                        {list.status}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Total Items</span>
                        <p className="font-semibold">{getTotalItems(list)}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Collected</span>
                        <p className="font-semibold text-green-600">{getCollectedItems(list)}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Unavailable</span>
                        <p className="font-semibold text-red-600">{getUnavailableItems(list)}</p>
                      </div>
                    </div>
                    
                    <p className="text-xs text-gray-500 mt-2">
                      Created: {new Date(list.createdAt).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* List Details */}
          <div>
            {selectedList ? (
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-gray-900">List Details</h3>
                  <button
                    onClick={() => setSelectedList(null)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>
                
                <div className="mb-6">
                  <h4 className="font-semibold mb-2 text-gray-900">Customer: {selectedList.customerName}</h4>
                  <p className="text-sm text-gray-900">List #{selectedList.id.slice(-6)}</p>
                </div>

                <div className="space-y-3 mb-6">
                  {selectedList.items.map(item => (
                    <div key={item.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h5 className="font-semibold text-gray-900">{item.product.name}</h5>
                          <p className="text-sm text-gray-700">Quantity: {item.quantity}</p>
                          <p className="text-sm text-gray-700">€{item.product.price.toFixed(2)} each</p>
                        </div>
                        <span className="text-2xl">{getItemStatusIcon(item.status)}</span>
                      </div>
                      
                      <div className="flex space-x-2">
                        <button
                          onClick={() => updateItemStatus(selectedList.id, item.id, 'collected')}
                          disabled={item.status === 'collected'}
                          className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium ${
                            item.status === 'collected'
                              ? 'bg-green-100 text-green-800 cursor-not-allowed'
                              : 'bg-green-500 text-white hover:bg-green-600'
                          }`}
                        >
                          ✅ Collected
                        </button>
                        <button
                          onClick={() => updateItemStatus(selectedList.id, item.id, 'unavailable')}
                          disabled={item.status === 'unavailable'}
                          className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium ${
                            item.status === 'unavailable'
                              ? 'bg-red-100 text-red-800 cursor-not-allowed'
                              : 'bg-red-500 text-white hover:bg-red-600'
                          }`}
                        >
                          ❌ Unavailable
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {isListComplete(selectedList) && (
                  <button
                    onClick={() => completeList(selectedList.id)}
                    className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 font-semibold"
                  >
                    Complete & Send to Payment System
                  </button>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-8 text-center">
                <p className="text-gray-500">Select a shopping list to view details</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

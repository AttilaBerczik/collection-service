'use client';

import { useState, useEffect } from 'react';
import { ShoppingList, User } from '../types';
import { apiService } from '../data/apiService';
import LoadingSpinner, { LoadingOverlay } from './LoadingSpinner';

interface EmployeeDashboardProps {
  user: User;
  onLogout: () => void;
}

export default function EmployeeDashboard({ user, onLogout }: EmployeeDashboardProps) {
  const [assignedLists, setAssignedLists] = useState<ShoppingList[]>([]);
  const [selectedList, setSelectedList] = useState<ShoppingList | null>(null);
  const [isOnline, setIsOnline] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingItem, setIsUpdatingItem] = useState<string | null>(null);
  const [isCompletingList, setIsCompletingList] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

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

  const loadAssignedLists = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      const lists = await apiService.getShoppingLists(undefined, user.id);
      const activeLists = lists.filter(list => list.status !== 'completed');
      setAssignedLists(activeLists);

      // Update selected list if it's still in the active lists
      if (selectedList) {
        const updatedSelectedList = activeLists.find(list => list.id === selectedList.id);
        setSelectedList(updatedSelectedList || null);
      }
    } catch (error) {
      console.error('Error loading assigned lists:', error);
      alert('Failed to load shopping lists. Please try again.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const updateItemStatus = async (listId: string, itemId: string, status: 'collected' | 'unavailable') => {
    try {
      setIsUpdatingItem(itemId);
      const success = await apiService.updateItemStatus(listId, itemId, status);
      if (success) {
        await loadAssignedLists(true); // Reload as refresh
      } else {
        alert('Failed to update item status. Please try again.');
      }
    } catch (error) {
      console.error('Error updating item status:', error);
      alert('Failed to update item status. Please try again.');
    } finally {
      setIsUpdatingItem(null);
    }
  };

  const completeList = async (listId: string) => {
    try {
      setIsCompletingList(true);
      const success = await apiService.updateListStatus(listId, 'completed');
      if (success) {
        await loadAssignedLists(true);
        setSelectedList(null);
        alert('List completed and sent to payment system!');
      } else {
        alert('Failed to complete list. Please try again.');
      }
    } catch (error) {
      console.error('Error completing list:', error);
      alert('Failed to complete list. Please try again.');
    } finally {
      setIsCompletingList(false);
    }
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

  // Show initial loading with spinner overlay instead of black screen
  if (isLoading && assignedLists.length === 0) {
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
          <div className="flex items-center justify-center min-h-96">
            <div className="text-center">
              <LoadingSpinner size="lg" className="text-blue-500 mb-4" />
              <p className="text-gray-600">Loading your assigned lists...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 relative">
      {/* Loading overlays for actions */}
      <LoadingOverlay isVisible={isCompletingList} message="Completing list..." />

      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <h1 className="text-3xl font-bold text-gray-900">Spar - Employee</h1>
              {isRefreshing && <LoadingSpinner size="sm" className="text-blue-500" />}
              <div className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-200 ${
                isOnline ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {isOnline ? 'Online' : 'Offline'}
              </div>
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
                    className={`bg-white rounded-lg shadow-md p-6 cursor-pointer transition-all duration-200 hover:shadow-lg ${
                      selectedList?.id === list.id ? 'ring-2 ring-blue-500 shadow-lg' : 'hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedList(list)}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-bold text-lg text-gray-900">List #{list.id.slice(-6)}</h3>
                        <p className="text-gray-700">{list.customerName}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium transition-all duration-150 ${getStatusColor(list.status)}`}>
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
              <div className="bg-white rounded-lg shadow-md p-6 transition-all duration-200">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-bold text-gray-900">List Details</h3>
                  <button
                    onClick={() => setSelectedList(null)}
                    className="text-gray-500 hover:text-gray-700 transition-colors"
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
                    <div key={item.id} className="border rounded-lg p-4 transition-all duration-150 hover:shadow-md">
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
                          disabled={item.status === 'collected' || isUpdatingItem === item.id}
                          className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-150 ${
                            item.status === 'collected'
                              ? 'bg-green-100 text-green-800 cursor-not-allowed'
                              : 'bg-green-500 text-white hover:bg-green-600'
                          } flex items-center justify-center space-x-2`}
                        >
                          {isUpdatingItem === item.id ? (
                            <>
                              <LoadingSpinner size="sm" className="text-white" />
                              <span>Updating...</span>
                            </>
                          ) : (
                            <>
                              <span>✅ Collected</span>
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => updateItemStatus(selectedList.id, item.id, 'unavailable')}
                          disabled={item.status === 'unavailable' || isUpdatingItem === item.id}
                          className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all duration-150 ${
                            item.status === 'unavailable'
                              ? 'bg-red-100 text-red-800 cursor-not-allowed'
                              : 'bg-red-500 text-white hover:bg-red-600'
                          } flex items-center justify-center space-x-2`}
                        >
                          {isUpdatingItem === item.id ? (
                            <>
                              <LoadingSpinner size="sm" className="text-white" />
                              <span>Updating...</span>
                            </>
                          ) : (
                            <>
                              <span>❌ Unavailable</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {isListComplete(selectedList) && (
                  <button
                    onClick={() => completeList(selectedList.id)}
                    disabled={isCompletingList}
                    className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 font-semibold transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    {isCompletingList ? (
                      <>
                        <LoadingSpinner size="sm" className="text-white" />
                        <span>Completing...</span>
                      </>
                    ) : (
                      <span>Complete & Send to Payment System</span>
                    )}
                  </button>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-8 text-center transition-all duration-200">
                <p className="text-gray-500">Select a shopping list to view details</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

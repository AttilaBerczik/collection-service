'use client';

import { useState } from 'react';
import { User } from '../types';
import { apiService, setCurrentUser } from '../data/apiService';
import LoadingSpinner from './LoadingSpinner';

interface LoginProps {
  onLogin: (user: User) => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [selectedRole, setSelectedRole] = useState<'customer' | 'employee'>('customer');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    try {
      setIsLoading(true);

      // Initialize database on first login
      await apiService.initializeDatabase();

      // Get users by role from database
      const users = await apiService.getUsers(selectedRole);
      const user = users.find(u => u.role === selectedRole);

      if (user) {
        setCurrentUser(user);
        onLogin(user);
      } else {
        alert('No user found for the selected role');
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Failed to login. Please check your database connection.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-md transition-all duration-200">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Spar Collection System
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Select your role to continue
          </p>
        </div>
        <div className="space-y-4">
          <div className="flex space-x-4">
            <button
              onClick={() => setSelectedRole('customer')}
              disabled={isLoading}
              className={`flex-1 py-3 px-4 rounded-lg border transition-all duration-200 ${
                selectedRole === 'customer'
                  ? 'bg-blue-500 text-white border-blue-500 shadow-md'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-blue-300'
              } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md'}`}
            >
              Customer
            </button>
            <button
              onClick={() => setSelectedRole('employee')}
              disabled={isLoading}
              className={`flex-1 py-3 px-4 rounded-lg border transition-all duration-200 ${
                selectedRole === 'employee'
                  ? 'bg-green-500 text-white border-green-500 shadow-md'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-green-300'
              } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-md'}`}
            >
              Employee
            </button>
          </div>
          <button
            onClick={handleLogin}
            disabled={isLoading}
            className="w-full py-3 px-4 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {isLoading ? (
              <>
                <LoadingSpinner size="sm" className="text-white" />
                <span>Initializing...</span>
              </>
            ) : (
              <span>Login as {selectedRole === 'customer' ? 'Customer' : 'Employee'}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

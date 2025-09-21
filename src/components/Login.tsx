'use client';

import { useState } from 'react';
import { User } from '../types';
import { mockUsers, setCurrentUser } from '../data/mockData';

interface LoginProps {
  onLogin: (user: User) => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [selectedRole, setSelectedRole] = useState<'customer' | 'employee'>('customer');

  const handleLogin = () => {
    const user = mockUsers.find(u => u.role === selectedRole);
    if (user) {
      setCurrentUser(user);
      onLogin(user);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-md">
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
              className={`flex-1 py-3 px-4 rounded-lg border ${
                selectedRole === 'customer'
                  ? 'bg-blue-500 text-white border-blue-500'
                  : 'bg-white text-gray-700 border-gray-300'
              }`}
            >
              Customer
            </button>
            <button
              onClick={() => setSelectedRole('employee')}
              className={`flex-1 py-3 px-4 rounded-lg border ${
                selectedRole === 'employee'
                  ? 'bg-green-500 text-white border-green-500'
                  : 'bg-white text-gray-700 border-gray-300'
              }`}
            >
              Employee
            </button>
          </div>
          <button
            onClick={handleLogin}
            className="w-full py-3 px-4 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
          >
            Login as {selectedRole === 'customer' ? 'Customer' : 'Employee'}
          </button>
        </div>
      </div>
    </div>
  );
}

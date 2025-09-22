"use client";

import { useState, useEffect } from "react";
import { User } from "../types";
import { getCurrentUser } from "../data/apiService";
import Login from "../components/Login";
import CustomerDashboard from "../components/CustomerDashboard";
import EmployeeDashboard from "../components/EmployeeDashboard";

export default function Home() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const user = getCurrentUser();
    setCurrentUser(user);
    setIsLoading(false);
  }, []);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem("currentUser");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!currentUser) {
    return <Login onLogin={handleLogin} />;
  }

  if (currentUser.role === "customer") {
    return <CustomerDashboard user={currentUser} onLogout={handleLogout} />;
  }

  return <EmployeeDashboard user={currentUser} onLogout={handleLogout} />;
}

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import RoleRedirect from './components/common/RoleRedirect';
import Notification from './components/common/Notification';

import Login from './components/auth/Login';
import Register from './components/auth/Register';
import AdminDashboard from './components/dashboard/AdminDashboard';
import UserDashboard from './components/dashboard/UserDashboard';
import StoreOwnerDashboard from './components/dashboard/StoreOwnerDashboard';
import Navbar from './components/common/Navbar';

import 'bootstrap/dist/css/bootstrap.min.css';

const AppContent = () => {
  const { notification } = useAuth();

  return (
    <Router>
      <div className="App">
        <Navbar />
        <div className="container mt-4">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route 
              path="/admin/*" 
              element={
                <ProtectedRoute requiredRole="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/user/*" 
              element={
                <ProtectedRoute requiredRole="user">
                  <UserDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/store-owner/*" 
              element={
                <ProtectedRoute requiredRole="store_owner">
                  <StoreOwnerDashboard />
                </ProtectedRoute>
              } 
            />
            <Route path="/" element={<RoleRedirect />} />
          </Routes>
        </div>
        {notification && (
          <Notification 
            message={notification.message} 
            type={notification.type} 
            onClose={() => {}} 
          />
        )}
      </div>
    </Router>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
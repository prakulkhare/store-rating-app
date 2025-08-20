import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getDashboardLink = () => {
    if (!currentUser) return null;
    
    switch (currentUser.role) {
      case 'admin':
        return <Link className="nav-link" to="/admin">Admin Dashboard</Link>;
      case 'store_owner':
        return <Link className="nav-link" to="/store-owner">Store Owner Dashboard</Link>;
      default:
        return <Link className="nav-link" to="/user">User Dashboard</Link>;
    }
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container">
        <Link className="navbar-brand" to="/">
          Store Rating App
        </Link>
        
        <div className="navbar-nav ms-auto">
          {currentUser ? (
            <>
              {getDashboardLink()}
              <span className="navbar-text mx-2">
                Welcome, {currentUser.name} ({currentUser.role})
              </span>
              <button className="btn btn-outline-light btn-sm" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link className="nav-link" to="/login">Login</Link>
              <Link className="nav-link" to="/register">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
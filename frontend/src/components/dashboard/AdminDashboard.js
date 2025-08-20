import React, { useState, useEffect } from 'react';
import { usersAPI, storesAPI } from '../../services/api';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalStores: 0,
    totalRatings: 0
  });
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    if (activeTab === 'dashboard') {
      fetchStats();
    }
  }, [activeTab]);

  const fetchStats = async () => {
    try {

      const usersResponse = await usersAPI.getAll();
      const storesResponse = await storesAPI.getAll();
      
      setStats({
        totalUsers: usersResponse.data.length,
        totalStores: storesResponse.data.length,
        totalRatings: 0 
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  return (
    <div>
      <h1>Admin Dashboard</h1>
      
      <ul className="nav nav-tabs">
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            Dashboard
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            Users
          </button>
        </li>
        <li className="nav-item">
          <button 
            className={`nav-link ${activeTab === 'stores' ? 'active' : ''}`}
            onClick={() => setActiveTab('stores')}
          >
            Stores
          </button>
        </li>
      </ul>

      <div className="tab-content mt-3">
        {activeTab === 'dashboard' && (
          <div className="row">
            <div className="col-md-4">
              <div className="card text-center">
                <div className="card-body">
                  <h5 className="card-title">Total Users</h5>
                  <h3 className="card-text">{stats.totalUsers}</h3>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card text-center">
                <div className="card-body">
                  <h5 className="card-title">Total Stores</h5>
                  <h3 className="card-text">{stats.totalStores}</h3>
                </div>
              </div>
            </div>
            <div className="col-md-4">
              <div className="card text-center">
                <div className="card-body">
                  <h5 className="card-title">Total Ratings</h5>
                  <h3 className="card-text">{stats.totalRatings}</h3>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div>
            <h3>User Management</h3>
            <p>User list and management functionality will be implemented here.</p>
          </div>
        )}

        {activeTab === 'stores' && (
          <div>
            <h3>Store Management</h3>
            <p>Store list and management functionality will be implemented here.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
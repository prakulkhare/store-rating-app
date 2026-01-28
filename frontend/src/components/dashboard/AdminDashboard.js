import React, { useState, useEffect, useCallback } from 'react';
import { usersAPI, storesAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const AdminDashboard = () => {
  const { showNotification } = useAuth();

  const [stats, setStats] = useState({
    totalUsers: 0,
    totalStores: 0,
    totalRatings: 0
  });

  const [activeTab, setActiveTab] = useState('dashboard');
  const [stores, setStores] = useState([]);
  const [users, setUsers] = useState([]);
  const [storesLoading, setStoresLoading] = useState(false);
  const [creatingStore, setCreatingStore] = useState(false);
  const [creatingUser, setCreatingUser] = useState(false);

  const [newStore, setNewStore] = useState({
    name: '',
    email: '',
    address: '',
    owner_id: ''
  });

  const [newStoreOwnerEmail, setNewStoreOwnerEmail] = useState('');

  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    address: '',
    role: 'user'
  });

  

  const fetchStats = useCallback(async () => {
    try {
      const usersResponse = await usersAPI.getAll();
      const storesResponse = await storesAPI.getAll();

      setStats({
        totalUsers: usersResponse.data.length,
        totalStores: storesResponse.data.length,
        totalRatings: 0
      });
    } catch (error) {
      console.error(error);
      showNotification('Error fetching statistics', 'error');
    }
  }, [showNotification]);

  const fetchStores = useCallback(async () => {
    try {
      setStoresLoading(true);
      const response = await storesAPI.getAll();
      setStores(response.data);
    } catch (error) {
      console.error(error);
      showNotification('Error fetching stores', 'error');
    } finally {
      setStoresLoading(false);
    }
  }, [showNotification]);

  const fetchUsers = useCallback(async () => {
    try {
      const response = await usersAPI.getAll();
      setUsers(response.data);
    } catch (error) {
      console.error(error);
      showNotification('Error fetching users', 'error');
    }
  }, [showNotification]);

 

  useEffect(() => {
    if (activeTab === 'dashboard') {
      fetchStats();
    } else if (activeTab === 'stores') {
      fetchStores();
      fetchUsers();
    } else if (activeTab === 'users') {
      fetchUsers();
    }
  }, [activeTab, fetchStats, fetchStores, fetchUsers]);

  

  const handleCreateStore = async (e) => {
    e.preventDefault();

    if (!newStore.name || !newStore.email || !newStore.address) {
      showNotification('Please fill all fields', 'error');
      return;
    }

    let ownerId = newStore.owner_id
      ? parseInt(newStore.owner_id, 10)
      : undefined;

    if (!ownerId && newStoreOwnerEmail) {
      const owner = users.find(
        (u) =>
          u.role === 'store_owner' &&
          u.email.toLowerCase() === newStoreOwnerEmail.toLowerCase()
      );
      if (owner) ownerId = owner.id;
    }

    if (!ownerId) {
      showNotification('Please select a valid store owner', 'error');
      return;
    }

    try {
      setCreatingStore(true);
      await storesAPI.create({
        name: newStore.name,
        email: newStore.email,
        address: newStore.address,
        owner_id: ownerId
      });

      setNewStore({ name: '', email: '', address: '', owner_id: '' });
      setNewStoreOwnerEmail('');
      fetchStores();
      showNotification('Store created successfully!');
    } catch (error) {
      console.error(error);
      showNotification(error.response?.data?.error || 'Error creating store', 'error');
    } finally {
      setCreatingStore(false);
    }
  };

  

  const handleCreateUser = async (e) => {
    e.preventDefault();

    if (
      !newUser.name ||
      !newUser.email ||
      !newUser.password ||
      !newUser.address
    ) {
      showNotification('Please fill all fields', 'error');
      return;
    }

    try {
      setCreatingUser(true);
      await usersAPI.create(newUser);
      setNewUser({ name: '', email: '', password: '', address: '', role: 'user' });
      fetchUsers();
      showNotification('User created successfully!');
    } catch (error) {
      console.error(error);
      showNotification(error.response?.data?.error || 'Error creating user', 'error');
    } finally {
      setCreatingUser(false);
    }
  };

  const getStoreOwnerName = (ownerId) => {
    const owner = users.find((u) => u.id === ownerId);
    return owner ? owner.name : 'Unassigned';
  };

  /* =========================
     UI
     ========================= */

  return (
    <div>
      <h1>Admin Dashboard</h1>

      <ul className="nav nav-tabs">
        {['dashboard', 'create-user', 'users', 'stores'].map((tab) => (
          <li className="nav-item" key={tab}>
            <button
              className={`nav-link ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab.replace('-', ' ').toUpperCase()}
            </button>
          </li>
        ))}
      </ul>

      <div className="mt-3">
        {activeTab === 'dashboard' && (
          <div className="row">
            <div className="col-md-4">Users: {stats.totalUsers}</div>
            <div className="col-md-4">Stores: {stats.totalStores}</div>
            <div className="col-md-4">Ratings: {stats.totalRatings}</div>
          </div>
        )}

        {activeTab === 'users' && (
          <ul>
            {users.map((u) => (
              <li key={u.id}>{u.name} ({u.role})</li>
            ))}
          </ul>
        )}

        {activeTab === 'stores' && (
          <ul>
            {stores.map((s) => (
              <li key={s.id}>
                {s.name} — Owner: {getStoreOwnerName(s.owner_id)}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;

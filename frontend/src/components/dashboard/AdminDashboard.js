import React, { useState, useEffect } from 'react';
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

  useEffect(() => {
    if (activeTab === 'dashboard') {
      fetchStats();
    } else if (activeTab === 'stores') {
      fetchStores();
      fetchUsers();
    } else if (activeTab === 'users') {
      fetchUsers();
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
      showNotification('Error fetching statistics', 'error');
    }
  };

  const fetchStores = async () => {
    try {
      setStoresLoading(true);
      const response = await storesAPI.getAll();
      setStores(response.data);
    } catch (error) {
      console.error('Error fetching stores:', error);
      showNotification('Error fetching stores', 'error');
    } finally {
      setStoresLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await usersAPI.getAll();
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      showNotification('Error fetching users', 'error');
    }
  };

  const handleCreateStore = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!newStore.name.trim() || !newStore.email.trim() || !newStore.address.trim()) {
      showNotification('Please fill in all required fields', 'error');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newStore.email)) {
      showNotification('Please enter a valid email address', 'error');
      return;
    }

    // Require an explicit store owner via email or dropdown selection
    let ownerIdToSend = newStore.owner_id ? parseInt(newStore.owner_id, 10) : undefined;
    if (!ownerIdToSend && newStoreOwnerEmail.trim()) {
      const matchByEmail = users.find(
        (u) => u.role === 'store_owner' && u.email.toLowerCase() === newStoreOwnerEmail.toLowerCase()
      );
      if (matchByEmail) {
        ownerIdToSend = matchByEmail.id;
      }
    }

    if (!ownerIdToSend) {
      showNotification('Please select a store owner from dropdown or type a valid store owner email', 'error');
      return;
    }

    try {
      setCreatingStore(true);
      await storesAPI.create({
        name: newStore.name,
        email: newStore.email,
        address: newStore.address,
        owner_id: ownerIdToSend
      });
      setNewStore({ name: '', email: '', address: '', owner_id: '' });
      setNewStoreOwnerEmail('');
      await fetchStores();
      showNotification('Store created successfully!');
    } catch (error) {
      console.error('Error creating store:', error);
      const errorMessage = error.response?.data?.error || 'Error creating store';
      showNotification(errorMessage, 'error');
    } finally {
      setCreatingStore(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!newUser.name.trim() || !newUser.email.trim() || !newUser.password.trim() || !newUser.address.trim()) {
      showNotification('Please fill in all required fields', 'error');
      return;
    }

    if (newUser.name.length < 20) {
      showNotification('Name must be at least 20 characters', 'error');
      return;
    }

    if (newUser.name.length > 60) {
      showNotification('Name must be no more than 60 characters', 'error');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newUser.email)) {
      showNotification('Please enter a valid email address', 'error');
      return;
    }

    const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,16}$/;
    if (!passwordRegex.test(newUser.password)) {
      showNotification('Password must be 8-16 characters with at least one uppercase letter and one special character', 'error');
      return;
    }

    if (newUser.address.length > 400) {
      showNotification('Address must be less than 400 characters', 'error');
      return;
    }

    try {
      setCreatingUser(true);
      await usersAPI.create(newUser);
      setNewUser({ name: '', email: '', password: '', address: '', role: 'user' });
      await fetchUsers();
      showNotification('User created successfully!');
    } catch (error) {
      console.error('Error creating user:', error);
      const errorMessage = error.response?.data?.error || 'Error creating user';
      showNotification(errorMessage, 'error');
    } finally {
      setCreatingUser(false);
    }
  };

  const getStoreOwnerName = (ownerId) => {
    if (!ownerId) return 'Unassigned';
    const owner = users.find(user => user.id === ownerId);
    return owner ? owner.name : 'Unknown';
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
            className={`nav-link ${activeTab === 'create-user' ? 'active' : ''}`}
            onClick={() => setActiveTab('create-user')}
          >
            Create User
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

        {activeTab === 'create-user' && (
          <div>
            <h3>Create New User</h3>
            <div className="card mb-4">
              <div className="card-header">
                <h5 className="mb-0">Add New User</h5>
              </div>
              <div className="card-body">
                <form onSubmit={handleCreateUser} noValidate>
                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label htmlFor="userName" className="form-label">Full Name (20-60 characters) *</label>
                        <input
                          type="text"
                          className="form-control"
                          id="userName"
                          value={newUser.name}
                          onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                          minLength="20"
                          maxLength="60"
                          required
                          disabled={creatingUser}
                        />
                        <div className="form-text">
                          Current length: {newUser.name.length}/60
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label htmlFor="userEmail" className="form-label">Email *</label>
                        <input
                          type="email"
                          className="form-control"
                          id="userEmail"
                          value={newUser.email}
                          onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                          required
                          disabled={creatingUser}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label htmlFor="userPassword" className="form-label">Password *</label>
                        <input
                          type="password"
                          className="form-control"
                          id="userPassword"
                          value={newUser.password}
                          onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                          placeholder="8-16 chars, 1 uppercase, 1 special char"
                          required
                          disabled={creatingUser}
                        />
                        <div className="form-text">
                          Must include: uppercase letter, special character (!@#$%^&*), 8-16 characters
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label htmlFor="userRole" className="form-label">Role *</label>
                        <select
                          className="form-select"
                          id="userRole"
                          value={newUser.role}
                          onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                          disabled={creatingUser}
                        >
                          <option value="user">Normal User</option>
                          <option value="store_owner">Store Owner</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  <div className="mb-3">
                    <label htmlFor="userAddress" className="form-label">Address (max 400 characters) *</label>
                    <textarea
                      className="form-control"
                      id="userAddress"
                      rows="2"
                      value={newUser.address}
                      onChange={(e) => setNewUser({...newUser, address: e.target.value})}
                      maxLength="400"
                      required
                      disabled={creatingUser}
                    />
                    <div className="form-text">
                      Current length: {newUser.address.length}/400
                    </div>
                  </div>
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={creatingUser}
                  >
                    {creatingUser ? 'Creating...' : 'Create User'}
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div>
            <h3>All Users</h3>
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">All Users</h5>
              </div>
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table table-striped">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Address</th>
                        <th>Created</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map(user => (
                        <tr key={user.id}>
                          <td>{user.name}</td>
                          <td>{user.email}</td>
                          <td>
                            <span className={`badge ${user.role === 'admin' ? 'bg-danger' : user.role === 'store_owner' ? 'bg-warning' : 'bg-primary'}`}>
                              {user.role}
                            </span>
                          </td>
                          <td>{user.address}</td>
                          <td>{new Date(user.created_at).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'stores' && (
          <div>
            <h3>Store Management</h3>
            
            {/* Create New Store Form */
            }
            <div className="card mb-4">
              <div className="card-header">
                <h5 className="mb-0">Add New Store</h5>
              </div>
              <div className="card-body">
                <form onSubmit={handleCreateStore} noValidate>
                  <div className="row">
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label htmlFor="storeName" className="form-label">Store Name *</label>
                        <input
                          type="text"
                          className="form-control"
                          id="storeName"
                          value={newStore.name}
                          onChange={(e) => setNewStore({...newStore, name: e.target.value})}
                          required
                          disabled={creatingStore}
                        />
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label htmlFor="storeEmail" className="form-label">Store Email *</label>
                        <input
                          type="email"
                          className="form-control"
                          id="storeEmail"
                          value={newStore.email}
                          onChange={(e) => setNewStore({...newStore, email: e.target.value})}
                          required
                          disabled={creatingStore}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="mb-3">
                    <label htmlFor="storeAddress" className="form-label">Store Address *</label>
                    <textarea
                      className="form-control"
                      id="storeAddress"
                      rows="2"
                      value={newStore.address}
                      onChange={(e) => setNewStore({...newStore, address: e.target.value})}
                      required
                      disabled={creatingStore}
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="storeOwnerEmail" className="form-label">Store Owner (required)</label>
                    <input
                      list="storeOwnerSuggestions"
                      type="email"
                      className="form-control"
                      id="storeOwnerEmail"
                      placeholder="Type owner email or select from list"
                      value={newStoreOwnerEmail}
                      onChange={(e) => setNewStoreOwnerEmail(e.target.value)}
                      required
                      disabled={creatingStore}
                    />
                    <datalist id="storeOwnerSuggestions">
                      {users.filter(u => u.role === 'store_owner').map(u => (
                        <option key={u.id} value={u.email}>{u.name} ({u.email})</option>
                      ))}
                    </datalist>
                    <div className="form-text">Select an existing store owner or type their email</div>
                  </div>
                  <div className="mb-3">
                    <label htmlFor="storeOwnerSelect" className="form-label">Or choose from dropdown</label>
                    <select
                      className="form-select"
                      id="storeOwnerSelect"
                      value={newStore.owner_id}
                      onChange={(e) => setNewStore({...newStore, owner_id: e.target.value})}
                      disabled={creatingStore}
                      required
                    >
                      <option value="">Select Store Owner</option>
                      {users.filter(user => user.role === 'store_owner').map(user => (
                        <option key={user.id} value={user.id}>{user.name} ({user.email})</option>
                      ))}
                    </select>
                  </div>
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={creatingStore}
                  >
                    {creatingStore ? 'Creating...' : 'Create Store'}
                  </button>
                </form>
              </div>
            </div>

            {/* Stores List */}
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">All Stores</h5>
              </div>
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table table-striped">
                    <thead>
                      <tr>
                        <th>Store Name</th>
                        <th>Email</th>
                        <th>Address</th>
                        <th>Owner</th>
                        <th>Average Rating</th>
                        <th>Total Ratings</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stores.map(store => (
                        <tr key={store.id}>
                          <td>{store.name}</td>
                          <td>{store.email}</td>
                          <td>{store.address}</td>
                          <td>
                            {store.owner_id ? (
                              <span className="badge bg-success">{getStoreOwnerName(store.owner_id)}</span>
                            ) : (
                              <span className="badge bg-secondary">Unassigned</span>
                            )}
                          </td>
                          <td>{store.average_rating ? `${parseFloat(store.average_rating).toFixed(1)} ⭐` : 'No ratings'}</td>
                          <td>{store.rating_count || 0}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
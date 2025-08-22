import React, { useState, useEffect } from 'react';
import { ratingsAPI, storesAPI, usersAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const StoreOwnerDashboard = () => {
  const { currentUser, showNotification } = useAuth();
  const [stores, setStores] = useState([]);
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedStore, setSelectedStore] = useState(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    fetchStoreData();
  }, []);

  const fetchStoreData = async () => {
    try {
      setLoading(true);
      const storesResponse = await storesAPI.getAll();
      const userStores = storesResponse.data.filter(store => store.owner_id === currentUser.id);
      setStores(userStores);
      if (userStores.length > 0) {
        setSelectedStore(userStores[0]);
        await fetchStoreRatings(userStores[0].id);
      }
    } catch (error) {
      console.error('Error fetching store data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStoreRatings = async (storeId) => {
    try {
      const ratingsResponse = await ratingsAPI.getStoreRatings(storeId);
      setRatings(ratingsResponse.data);
    } catch (error) {
      console.error('Error fetching ratings:', error);
    }
  };

  const handleStoreSelect = async (store) => {
    setSelectedStore(store);
    await fetchStoreRatings(store.id);
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showNotification('New passwords do not match', 'error');
      return;
    }

    const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,16}$/;
    if (!passwordRegex.test(passwordForm.newPassword)) {
      showNotification('New password must be 8-16 characters with at least one uppercase letter and one special character', 'error');
      return;
    }

    try {
      setChangingPassword(true);
      await usersAPI.updatePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      showNotification('Password updated successfully!');
      setShowPasswordModal(false);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      console.error('Error changing password:', error);
      const errorMessage = error.response?.data?.error || 'Error changing password';
      showNotification(errorMessage, 'error');
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) {
    return null;
  }

  if (stores.length === 0) {
    return (
      <div>
        <h1>Store Owner Dashboard</h1>
        <div className="alert alert-info">
          <h4>No Stores Assigned</h4>
          <p>You don't have any stores assigned to you yet. Please contact an administrator to assign stores to your account.</p>
          <p><strong>Your Account:</strong> {currentUser.name} ({currentUser.email})</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1>Store Owner Dashboard</h1>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <p className="text-muted mb-0">Welcome, {currentUser.name} ({currentUser.email})</p>
        <button 
          className="btn btn-outline-secondary btn-sm"
          onClick={() => setShowPasswordModal(true)}
        >
          Change Password
        </button>
      </div>
      
      {stores.length > 1 && (
        <div className="card mb-4">
          <div className="card-header">
            <h5 className="mb-0">Select Store</h5>
          </div>
          <div className="card-body">
            <div className="btn-group" role="group">
              {stores.map(store => (
                <button
                  key={store.id}
                  type="button"
                  className={`btn ${selectedStore?.id === store.id ? 'btn-primary' : 'btn-outline-primary'}`}
                  onClick={() => handleStoreSelect(store)}
                >
                  {store.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {selectedStore && (
        <>
      <div className="card mb-4">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Store Information</h5>
              <button className="btn btn-sm btn-outline-secondary" onClick={() => fetchStoreRatings(selectedStore.id)}>Refresh Ratings</button>
            </div>
        <div className="card-body">
              <div className="row">
                <div className="col-md-6">
                  <p><strong>Store Name:</strong> {selectedStore.name}</p>
                  <p><strong>Store Email:</strong> {selectedStore.email}</p>
                  <p><strong>Address:</strong> {selectedStore.address}</p>
                </div>
                <div className="col-md-6">
                  <p><strong>Average Rating:</strong> 
                    {selectedStore.average_rating ? (
                      <span className="ms-2">
                        {parseFloat(selectedStore.average_rating).toFixed(1)} ⭐
                      </span>
                    ) : (
                      <span className="ms-2 text-muted">No ratings yet</span>
                    )}
                  </p>
                  <p><strong>Total Ratings:</strong> {selectedStore.rating_count || 0}</p>
                  <p><strong>Store Owner:</strong> {currentUser.name}</p>
                </div>
              </div>
        </div>
      </div>

          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Recent Ratings</h5>
            </div>
            <div className="card-body">
      {ratings.length > 0 ? (
        <div className="table-responsive">
          <table className="table table-striped">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Rating</th>
                <th>Date</th>
                        <th>Comment</th>
              </tr>
            </thead>
            <tbody>
              {ratings.map(rating => (
                <tr key={rating.id}>
                  <td>{rating.name}</td>
                  <td>{rating.email}</td>
                          <td>
                            <span className="badge bg-warning text-dark">
                              {rating.rating} ⭐
                            </span>
                          </td>
                  <td>{new Date(rating.created_at).toLocaleDateString()}</td>
                          <td>{rating.comment || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="alert alert-info">
                  No ratings yet for this store.
        </div>
              )}
            </div>
          </div>
        </>
      )}

      {showPasswordModal && (
        <div className="modal fade show" style={{ display: 'block' }} tabIndex="-1">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Change Password</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setShowPasswordModal(false)}
                ></button>
              </div>
              <form onSubmit={handleChangePassword}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label htmlFor="currentPassword" className="form-label">Current Password</label>
                    <input
                      type="password"
                      className="form-control"
                      id="currentPassword"
                      value={passwordForm.currentPassword}
                      onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                      required
                      disabled={changingPassword}
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="newPassword" className="form-label">New Password</label>
                    <input
                      type="password"
                      className="form-control"
                      id="newPassword"
                      value={passwordForm.newPassword}
                      onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                      placeholder="8-16 chars, 1 uppercase, 1 special char"
                      required
                      disabled={changingPassword}
                    />
                    <div className="form-text">
                      Must include: uppercase letter, special character (!@#$%^&*), 8-16 characters
                    </div>
                  </div>
                  <div className="mb-3">
                    <label htmlFor="confirmPassword" className="form-label">Confirm New Password</label>
                    <input
                      type="password"
                      className="form-control"
                      id="confirmPassword"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                      required
                      disabled={changingPassword}
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={() => setShowPasswordModal(false)}
                    disabled={changingPassword}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="btn btn-primary"
                    disabled={changingPassword}
                  >
                    {changingPassword ? 'Changing...' : 'Change Password'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {showPasswordModal && (
        <div className="modal-backdrop fade show"></div>
      )}
    </div>
  );
};

export default StoreOwnerDashboard;
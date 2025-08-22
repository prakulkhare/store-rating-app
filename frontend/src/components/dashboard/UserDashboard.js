import React, { useState, useEffect } from 'react';
import { storesAPI, ratingsAPI, usersAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const UserDashboard = () => {
  const { currentUser, showNotification } = useAuth();
  const [stores, setStores] = useState([]);
  const [userRatings, setUserRatings] = useState({});
  const [ratingForms, setRatingForms] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    fetchStores();
  }, []);

  const fetchStores = async () => {
    try {
      const response = await storesAPI.getAll();
      setStores(response.data);
      
      const ratings = {};
      const forms = {};
      for (const store of response.data) {
        try {
          const ratingResponse = await ratingsAPI.getUserRating(store.id);
          ratings[store.id] = ratingResponse.data;
          forms[store.id] = {
            rating: ratingResponse.data.rating || 0,
            comment: ratingResponse.data.comment || ''
          };
        } catch (error) {
          ratings[store.id] = { rating: null, comment: null };
          forms[store.id] = { rating: 0, comment: '' };
        }
      }
      setUserRatings(ratings);
      setRatingForms(forms);
    } catch (error) {
      console.error('Error fetching stores:', error);
      showNotification('Error fetching stores', 'error');
    }
  };

  const handleRating = async (storeId, rating, comment) => {
    try {
      await ratingsAPI.submit({
        store_id: storeId,
        rating: rating,
        comment: comment || null
      });
      
      setUserRatings(prev => ({
        ...prev,
        [storeId]: { rating, comment }
      }));
      
      showNotification('Rating submitted successfully!');
    } catch (error) {
      console.error('Error submitting rating:', error);
      const errorMessage = error.response?.data?.error || 'Error submitting rating';
      showNotification(errorMessage, 'error');
    }
  };

  const handleStarClick = (storeId, starValue) => {
    setRatingForms(prev => ({
      ...prev,
      [storeId]: {
        ...prev[storeId],
        rating: starValue
      }
    }));
  };

  const handleCommentChange = (storeId, comment) => {
    setRatingForms(prev => ({
      ...prev,
      [storeId]: {
        ...prev[storeId],
        comment: comment
      }
    }));
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

  const filteredStores = stores.filter(store =>
    store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    store.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <h1>User Dashboard</h1>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <p className="text-muted mb-0">Welcome, {currentUser.name} ({currentUser.email})</p>
        <button 
          className="btn btn-outline-secondary btn-sm"
          onClick={() => setShowPasswordModal(true)}
        >
          Change Password
        </button>
      </div>
      
      <div className="mb-3">
        <input
          type="text"
          className="form-control"
          placeholder="Search stores by name or address..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="row">
        {filteredStores.map(store => {
          const ratingForm = ratingForms[store.id] || { rating: 0, comment: '' };
          const userRating = userRatings[store.id];
          const selectedRating = ratingForm.rating;

          return (
            <div key={store.id} className="col-md-6 col-lg-4 mb-4">
              <div className="card h-100">
              <div className="card-body">
                <h5 className="card-title">{store.name}</h5>
                <p className="card-text">
                    <strong>Email:</strong> {store.email}<br/>
                    <strong>Address:</strong> {store.address}
                  </p>
                  
                  <div className="mb-2">
                    <strong>Average Rating:</strong>
                    {store.average_rating ? (
                      <span className="ms-2">
                        {parseFloat(store.average_rating).toFixed(1)} ⭐
                      </span>
                    ) : (
                      <span className="ms-2 text-muted">No ratings yet</span>
                    )}
                    <span className="ms-2 text-muted">({store.rating_count || 0} ratings)</span>
                  </div>

                  {userRating && userRating.rating && (
                    <div className="alert alert-info py-2 mb-2">
                      <small>
                        <strong>Your Rating:</strong> {userRating.rating} ⭐
                        {userRating.comment && (
                          <span className="ms-2">- "{userRating.comment}"</span>
                        )}
                      </small>
                    </div>
                  )}

                  <div className="mb-2">
                    <strong>Rate this store:</strong>
                    <div className="mt-1">
                      {[1, 2, 3, 4, 5].map(star => (
                      <button
                          key={star}
                        type="button"
                          className={`btn btn-sm me-1 ${star <= selectedRating ? 'btn-primary text-white' : 'btn-outline-primary'}`}
                          onClick={() => handleStarClick(store.id, star)}
                      >
                          {star} ⭐
                      </button>
                    ))}
                  </div>
                </div>

                  {selectedRating > 0 && (
                    <>
                      <div className="mb-2">
                        <label className="form-label">Comment (optional):</label>
                        <textarea
                          className="form-control"
                          rows="2"
                          value={ratingForm.comment}
                          onChange={(e) => handleCommentChange(store.id, e.target.value)}
                          placeholder="Share your experience..."
                        />
                      </div>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => handleRating(store.id, selectedRating, ratingForm.comment)}
                      >
                        {userRating && userRating.rating ? 'Update Rating' : 'Submit Rating'}
                      </button>
                    </>
                  )}
              </div>
            </div>
          </div>
          );
        })}
      </div>

      {filteredStores.length === 0 && (
        <div className="alert alert-info">
          {searchTerm ? 'No stores found matching your search.' : 'No stores available for rating.'}
        </div>
      )}

      {/* Change Password Modal */}
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

      {/* Modal Backdrop */}
      {showPasswordModal && (
        <div className="modal-backdrop fade show"></div>
      )}
    </div>
  );
};

export default UserDashboard;
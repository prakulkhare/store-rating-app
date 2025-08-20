import React, { useState, useEffect } from 'react';
import { ratingsAPI, storesAPI } from '../../services/api';

const StoreOwnerDashboard = () => {
  const [store, setStore] = useState(null);
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStoreData();
  }, []);

  const fetchStoreData = async () => {
    try {

      const storesResponse = await storesAPI.getAll();
      const userStores = storesResponse.data.filter(s => s.owner_id);
      
      if (userStores.length > 0) {
        const userStore = userStores[0];
        setStore(userStore);

        const ratingsResponse = await ratingsAPI.getStoreRatings(userStore.id);
        setRatings(ratingsResponse.data);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching store data:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading store data...</div>;
  }

  if (!store) {
    return (
      <div>
        <h1>Store Owner Dashboard</h1>
        <div className="alert alert-info">
          You don't own any stores yet. Please contact an administrator to assign a store to you.
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1>Store Owner Dashboard</h1>
      
      <div className="card mb-4">
        <div className="card-body">
          <h5 className="card-title">Store Information</h5>
          <p><strong>Name:</strong> {store.name}</p>
          <p><strong>Address:</strong> {store.address}</p>
          <p><strong>Email:</strong> {store.email}</p>
          <p><strong>Average Rating:</strong> {store.average_rating || 'No ratings yet'}</p>
          <p><strong>Total Ratings:</strong> {store.rating_count || 0}</p>
        </div>
      </div>

      <h3>Recent Ratings</h3>
      {ratings.length > 0 ? (
        <div className="table-responsive">
          <table className="table table-striped">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Rating</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {ratings.map(rating => (
                <tr key={rating.id}>
                  <td>{rating.name}</td>
                  <td>{rating.email}</td>
                  <td>{rating.rating} ⭐</td>
                  <td>{new Date(rating.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="alert alert-info">
          No ratings yet for your store.
        </div>
      )}
    </div>
  );
};

export default StoreOwnerDashboard;
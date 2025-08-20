import React, { useState, useEffect } from 'react';
import { storesAPI, ratingsAPI } from '../../services/api';

const UserDashboard = () => {
  const [stores, setStores] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStores();
  }, []);

  const fetchStores = async () => {
    try {
      const response = await storesAPI.getAll();
      setStores(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching stores:', error);
      setLoading(false);
    }
  };

  const handleRating = async (storeId, rating) => {
    try {
      await ratingsAPI.submit({ store_id: storeId, rating });
      alert('Rating submitted successfully!');
      fetchStores(); 
    } catch (error) {
      console.error('Error submitting rating:', error);
      alert('Error submitting rating');
    }
  };

  const filteredStores = stores.filter(store =>
    store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    store.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div>Loading stores...</div>;
  }

  return (
    <div>
      <h1>User Dashboard</h1>
      
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
        {filteredStores.map(store => (
          <div key={store.id} className="col-md-6 col-lg-4 mb-3">
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">{store.name}</h5>
                <p className="card-text">
                  <strong>Address:</strong> {store.address}<br/>
                  <strong>Average Rating:</strong> {store.average_rating || 'No ratings yet'}
                </p>
                
                <div className="mb-3">
                  <label className="form-label">Your Rating:</label>
                  <div className="btn-group" role="group">
                    {[1, 2, 3, 4, 5].map(rating => (
                      <button
                        key={rating}
                        type="button"
                        className="btn btn-outline-primary"
                        onClick={() => handleRating(store.id, rating)}
                      >
                        {rating}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredStores.length === 0 && (
        <div className="text-center">
          <p>No stores found matching your search.</p>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;
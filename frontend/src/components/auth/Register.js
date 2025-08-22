import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    address: '',
    role: 'user'
  });
  const [loading, setLoading] = useState(false);
  
  const { register, showNotification } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = [];

    if (formData.name.length < 20) {
      newErrors.push('Name must be at least 20 characters');
    }
    if (formData.name.length > 60) {
      newErrors.push('Name must be no more than 60 characters');
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.push('Passwords do not match');
    }
    if (formData.address.length > 400) {
      newErrors.push('Address must be less than 400 characters');
    }

    if (newErrors.length > 0) {
      
      showNotification(newErrors[0], 'error');
      return;
    }

    try {
      setLoading(true);
      const result = await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        address: formData.address,
        role: formData.role
      });

      if (result.success && result.user) {
        const role = result.user.role;
        const destination = role === 'admin' 
          ? '/admin' 
          : role === 'store_owner' 
            ? '/store-owner' 
            : '/user';
        navigate(destination);
      }
    } catch (err) {
      console.error('Registration error:', err);
    }
    setLoading(false);
  };

  return (
    <div className="row justify-content-center">
      <div className="col-md-8 col-lg-6">
        <div className="card">
          <div className="card-body">
            <h2 className="text-center mb-4">Register</h2>
            
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="name" className="form-label">
                  Full Name (20-60 characters)
                  <span className="text-muted"> - {formData.name.length}/60</span>
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  minLength="20"
                  maxLength="60"
                  required
                />
                <div className="form-text">
                  Current length: {formData.name.length} characters
                </div>
              </div>
              
              <div className="mb-3">
                <label htmlFor="role" className="form-label">Role</label>
                <select
                  id="role"
                  name="role"
                  className="form-select"
                  value={formData.role}
                  onChange={handleChange}
                >
                  <option value="user">Normal User</option>
                  <option value="store_owner">Store Owner</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="mb-3">
                <label htmlFor="email" className="form-label">Email</label>
                <input
                  type="email"
                  className="form-control"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="mb-3">
                <label htmlFor="address" className="form-label">
                  Address (max 400 characters)
                  <span className="text-muted"> - {formData.address.length}/400</span>
                </label>
                <textarea
                  className="form-control"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  maxLength="400"
                  rows="3"
                  required
                />
                <div className="form-text">
                  Current length: {formData.address.length} characters
                </div>
              </div>
              
              <div className="mb-3">
                <label htmlFor="password" className="form-label">Password</label>
                <input
                  type="password"
                  className="form-control"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="8-16 characters, 1 uppercase, 1 special character (!@#$%^&*)"
                  required
                />
                <div className="form-text">
                  Must include: uppercase letter, special character (!@#$%^&*), 8-16 characters
                </div>
              </div>
              
              <div className="mb-3">
                <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
                <input
                  type="password"
                  className="form-control"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <button 
                disabled={loading} 
                className="btn btn-primary w-100" 
                type="submit"
              >
                {loading ? 'Creating Account...' : 'Register'}
              </button>
            </form>
            
            <div className="text-center mt-3">
              <Link to="/login">Already have an account? Login here</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
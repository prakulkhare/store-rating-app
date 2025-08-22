import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      const result = await login(email, password);
      
      if (result.success) {
        switch (result.user.role) {
          case 'admin':
            navigate('/admin');
            break;
          case 'store_owner':
            navigate('/store-owner');
            break;
          default:
            navigate('/user');
        }
      }
    } catch (err) {
      console.error('Login error:', err);
    }
    setLoading(false);
  };

  return (
    <div className="row justify-content-center">
      <div className="col-md-6 col-lg-4">
        <div className="card">
          <div className="card-body">
            <h2 className="text-center mb-4">Login</h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label htmlFor="email" className="form-label">Email</label>
                <input
                  type="email"
                  className="form-control"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="mb-3">
                <label htmlFor="password" className="form-label">Password</label>
                <input
                  type="password"
                  className="form-control"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <button 
                disabled={loading} 
                className="btn btn-primary w-100" 
                type="submit"
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </form>
            <div className="text-center mt-3">
              <Link to="/register">Need an account? Register here</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
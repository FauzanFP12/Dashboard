import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';  // Import toast and Toaster from react-hot-toast

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/login`, { username, password });
      const { accessToken, role, fullName } = response.data;

      // Save token and role to local storage for future use
      sessionStorage.setItem('token', accessToken);
      sessionStorage.setItem('role', role);

      // Save user details (including fullName) to localStorage
      sessionStorage.setItem('user', JSON.stringify({
        username: username,
        fullName: fullName,
      }));

      // Display success message
      toast.success('Login successful!');

      setTimeout(() => {
        // Redirect based on role after the delay
        if (role === 'admin') {
          navigate('/');
          window.location.reload(); // Refresh the page
        } else if (role === 'user') {
          navigate('/help-desk/create');
          window.location.reload(); // Refresh the page
        } else {
          navigate('/dashboard'); // Default fallback for other roles
          window.location.reload(); // Refresh the page
        }

      }, 1000);  // Delay for 2 seconds before redirecting
    } catch (error) {
      // Display failure message
      const message = error.response?.data?.message || 'Unable to login. Please try again.';
      setErrorMessage(message);
      toast.error('Login failed. Please try again.');
    }
  };

  return (
    <div className="login-container">
      <h3 >Login to Dashboard</h3>
      {errorMessage && <p className="error">{errorMessage}</p>}
      <form onSubmit={handleLoginSubmit}>
        <div className="form-group">
          <label>Username</label>
          <input
            type="text"
            class="custom-input" 
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            placeholder="Enter your username"
          />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            class="custom-input" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Enter your password"
          />
        </div>
        <button type="submit">Login</button>
      </form>

      {/* Toaster container to show toasts */}
      <Toaster position="top-center" />
    </div>
  );
};

export default Login;

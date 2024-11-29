import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Header.css';
import toast from 'react-hot-toast';  // Add toast notification

const Header = ({ toggleSidebar }) => {
  const [user, setUser] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    try {
      // Retrieve user data from localStorage
      const storedUser = sessionStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser)); // Parse and set the user data
      }
    } catch (error) {
      console.error('Error parsing user data from localStorage:', error);
      setUser(null); // Reset user if error occurs
    }
  }, []);

  const handleProfileClick = () => {
    setShowDropdown((prev) => !prev);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('token'); // Remove the token
    sessionStorage.removeItem('user'); // Remove the user data
    toast.success('Logout successful');  // Display success toast notification
    navigate('/login'); // Redirect to login page
  };

  return (
    <header className="app-header">
      <button className="sidebar-toggle" onClick={toggleSidebar}>
        ☰
      </button>
      <h1 className="heading">Manajemen Insiden</h1>

      <div className="user-info">
        <div className="profile" onClick={handleProfileClick}>
          {/* Check if the user has a profile picture */}
          {user && user.profilePicture ? (
            <img
              src={user.profilePicture}
              alt="User Profile"
              className="user-profile-picture"
            />
          ) : (
            <div className="default-avatar">👤</div> // Default avatar if no profile picture
          )}
          {/* Display fullName or 'Guest' if no user is logged in */}
          <span className="username">{user ? user.fullName : 'Guest'}</span>
        </div>

        {showDropdown && (
          <div className="dropdown-menu">
            <button onClick={handleLogout}>Logout</button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;

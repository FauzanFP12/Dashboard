import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Register.css';

const Register = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('user');
  const [message, setMessage] = useState('');
  const [userList, setUserList] = useState([]);
  const [editingUser, setEditingUser] = useState(null);
  const [showModal, setShowModal] = useState(false); // State to control modal visibility

  // Fetch the list of users
  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/users`);
      setUserList(response.data);
    } catch (error) {
      console.error('Error fetching user list:', error);
      setMessage('Failed to load users');
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Handle form submission for registering or updating a user
  // Handle form submission for registering or updating a user
  const handleSubmit = async (e) => {
    e.preventDefault();
  
    // Ensure all required fields are filled in
    if (!username || !password || !fullName) {
      setMessage('Please fill in all fields');
      return;
    }
  
    // Prepare the user data for submission
    const userData = { username, password, fullName, role };
  
    try {
      let response;
  
      // If editing an existing user, send the _id for the PUT request
      if (editingUser && editingUser._id) {
        response = await axios.put(
          `${process.env.REACT_APP_API_URL}/api/users/${editingUser._id}`, // Use _id to update
          userData
        );
        setMessage('User updated successfully');
      } else {
        // If creating a new user, send the data for POST request
        response = await axios.post(`${process.env.REACT_APP_API_URL}/api/register`, userData);
        setMessage('User registered successfully');
      }
  
      // After successful submission, refresh the user list
      fetchUsers();
  
      // Reset the form fields after submission
      resetForm();
  
      // Close the modal (if applicable)
      setShowModal(false);
  
    } catch (error) {
      // Handle API errors more explicitly
      if (error.response) {
        // Server responded with an error
        setMessage(error.response?.data?.message || 'An error occurred while processing the request');
      } else if (error.request) {
        // Request was made but no response was received
        setMessage('No response received from server');
      } else {
        // Something went wrong while setting up the request
        setMessage(`Error: ${error.message}`);
      }
    }
  };
  
  
  
  
  

  // Reset the form fields
  const resetForm = () => {
    setUsername('');
    setPassword('');
    setFullName('');
    setRole('user');
    setEditingUser(null);
  };

  // Handle editing user
  const handleEdit = (user) => {
    setUsername(user.username);
    setFullName(user.fullName);
    setRole(user.role);
    setEditingUser(user);
    setShowModal(true); // Open modal for editing
  };

  // Handle deleting user
  const handleDelete = async (userId) => {
    // Show confirmation prompt before deleting
    const confirmDelete = window.confirm('Are you sure you want to delete this user?');
    if (!confirmDelete) return; // Exit if user cancels
  
    try {
      // Send DELETE request with userId to the backend
      const response = await axios.delete(`${process.env.REACT_APP_API_URL}/api/users/${userId}`);
      setMessage('User deleted successfully'); // Show success message
      fetchUsers(); // Refresh the user list to reflect the deletion
    } catch (error) {
      // Show error message if something goes wrong
      setMessage(error.response?.data?.message || 'Error deleting user');
    }
  };
  
  
  

  return (
    <div className="register-container">
      <h2>Registered Users</h2>

      {/* Button to show modal */}
      <button className="add-account-btn" onClick={() => setShowModal(true)}>Tambah Akun</button>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content2">
            <h3>{editingUser ? 'Edit User' : 'Register User'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="username">Username</label>
                <input
                  type="text"
                  id="username"
                  className="custom-input"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  className="custom-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="fullName">Full Name</label>
                <input
                  type="text"
                  id="fullName"
                  className="custom-input"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="role">Role</label>
                <select
                  id="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  required
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <button type="submit" className="submit-btn">{editingUser ? 'Update' : 'Register'}</button>
              <button type="button" className="reset-btn" onClick={resetForm}>Reset</button>
              <button type="button" className="close-modal-btn2" onClick={() => setShowModal(false)}>Close</button>
            </form>
          </div>
        </div>
      )}

      {/* User Table */}
      <table className="user-table2">
        <thead>
          <tr>
            <th>Full Name</th>
            <th>Username</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {userList.length > 0 ? (
            userList.map((user) => (
              <tr key={user._id}> {/* Use _id as the key */}
                <td>{user.fullName}</td>
                <td>{user.username}</td>
                <td>{user.role}</td>
                <td>
                  <button onClick={() => handleEdit(user)} className="edit-btn">Edit</button>
                  <button onClick={() => handleDelete(user._id)} className="delete-btn">Delete</button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4">No users found</td>
            </tr>
          )}
        </tbody>
      </table>

      {message && (
        <p className={message.toLowerCase().includes('error') ? 'error-message' : 'success-message'}>
          {message}
        </p>
      )}
    </div>
  );
};

export default Register;

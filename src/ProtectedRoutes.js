import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ requiredRole, children }) => {
  // Ambil token dari sessionStorage atau dari sumber lain (misalnya, state global)
  const token = sessionStorage.getItem('token');
  
  // Ambil peran pengguna dari sessionStorage (atau tempat lain seperti state global)
  const userRole = sessionStorage.getItem('role');

  // Jika tidak ada token, arahkan pengguna ke halaman login
  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Jika peran pengguna tidak sesuai dengan requiredRole, arahkan ke halaman help
  if (!requiredRole.includes(userRole)) {
    return <Navigate to="/help-desk/create" />;
  }

  // Jika pengguna memiliki token dan peran sesuai, tampilkan komponen yang diminta
  return children;
};

export default ProtectedRoute;

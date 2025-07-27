// client/src/pages/Dashboard.jsx (UPDATED: Now a Redirector)
import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom'; // Import Navigate

const Dashboard = () => {
  const { userRole, loading: authLoading } = useAuth();

  // We handle loading in AppRoutes, but keep a check here for clarity
  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center text-xl text-gray-700">Loading dashboard...</div>;
  }

  // Redirect based on role
  if (userRole === 'client') {
    return <Navigate to="/client-dashboard" replace />;
  } else if (userRole === 'freelancer') {
    return <Navigate to="/freelancer-dashboard" replace />;
  } else {
    // Fallback for unexpected roles or if role isn't loaded (should be caught by PrivateRoute)
    return <Navigate to="/" replace />; // Redirect to home or login
  }
};

export default Dashboard;
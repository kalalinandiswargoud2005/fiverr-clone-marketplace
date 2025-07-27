// client/src/App.jsx (UPDATED: Direct Admin Redirect)
import React from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate, useLocation as useReactRouterLocation } from 'react-router-dom';

// Import all your page components
import Register from './pages/Register';
import Login from './pages/Login'; // Keep Login import for AuthModal use, even if route removed
import Dashboard from './pages/Dashboard'; // Dashboard is now a redirector
import ClientDashboard from './pages/ClientDashboard'; // NEW: Client Dashboard
import FreelancerDashboard from './pages/FreelancerDashboard'; // NEW: Freelancer Dashboard
import Gigs from './pages/Gigs';
import GigDetail from './pages/GigDetail';
import OrderSuccess from './pages/OrderSuccess';
import MyOrders from './pages/MyOrders';
import CreateGig from './pages/CreateGig';
import Home from './pages/Home';
import Chat from './pages/Chat';
import MyGigs from './pages/MyGigs';
import AdminDashboard from './pages/AdminDashboard'; // NEW: Admin Dashboard

// Import your global components
import Header from './components/Header';
import Footer from './components/Footer';

// Import authentication context
import { useAuth } from './context/AuthContext';


// PrivateRoute component: Only checks if authenticated
const PrivateRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-xl text-gray-700">Loading application...</div>;
  }
  return currentUser ? children : <Navigate to="/" replace />; // Redirect to Home (for login modal) if not logged in
};

// ClientRoute component: Ensures authenticated AND is a client
const ClientRoute = ({ children }) => {
  const { currentUser, userRole, loading } = useAuth();
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-xl text-gray-700">Checking client permissions...</div>;
  }
  if (!currentUser) {
    return <Navigate to="/" replace />; // Not logged in -> Home (for login modal)
  }
  if (userRole !== 'client') {
    return <Navigate to="/dashboard" replace />; // Logged in but wrong role -> general dashboard redirector
  }
  return children;
};

// FreelancerRoute component: Ensures authenticated AND is a freelancer
const FreelancerRoute = ({ children }) => {
  const { currentUser, userRole, loading } = useAuth();
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-xl text-gray-700">Checking freelancer permissions...</div>;
  }
  if (!currentUser) {
    return <Navigate to="/" replace />; // Not logged in -> Home (for login modal)
  }
  if (userRole !== 'freelancer') {
    return <Navigate to="/dashboard" replace />; // Logged in but wrong role -> general dashboard redirector
  }
  return children;
};

// AdminRoute component: Ensures authenticated AND is an admin
const AdminRoute = ({ children }) => {
  const { currentUser, userRole, loading } = useAuth();
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-xl text-gray-700">Checking admin permissions...</div>;
  }
  if (!currentUser) {
    return <Navigate to="/" replace />; // Not logged in -> Home (for login modal)
  }
  if (userRole !== 'admin') {
    return <Navigate to="/dashboard" replace />; // Logged in but not admin -> general dashboard redirector
  }
  return children;
};


const AppRoutes = () => {
  const { currentUser, userRole, loading } = useAuth(); // Also get userRole here
  const location = useReactRouterLocation();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-xl text-gray-700">Loading user session...</div>;
  }

  // `isAuthPage` check is now less critical as these routes are now handled by modal
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  return (
    // Add padding-top to account for the fixed header's height
    <main className="pt-[100px] md:pt-[90px]">
      <Routes>
        {/*
          Removed explicit /register and /login routes.
          Authentication is now handled by the AuthModal, triggered from the Header.
        */}

        {/* Public Routes (accessible to all, regardless of login) */}
        <Route path="/gigs" element={<Gigs />} />
        <Route path="/gig/:gigId" element={<GigDetail />} />
        <Route path="/order-success" element={<OrderSuccess />} />

        {/* General Dashboard Redirector (Publicly accessible but redirects based on role) */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute> {/* Protect with PrivateRoute, so only logged in users hit this */}
              <Dashboard /> {/* This Dashboard component now just redirects */}
            </PrivateRoute>
          }
        />

        {/* Dedicated Role-Based Dashboards */}
        <Route
          path="/client-dashboard"
          element={
            <ClientRoute>
              <ClientDashboard />
            </ClientRoute>
          }
        />
        <Route
          path="/freelancer-dashboard"
          element={
            <FreelancerRoute>
              <FreelancerDashboard />
            </FreelancerRoute>
          }
        />

        {/* Other Protected Routes (use PrivateRoute or specific role route) */}
        <Route
          path="/my-orders"
          element={
            <PrivateRoute> {/* Both clients and freelancers can view their orders */}
              <MyOrders />
            </PrivateRoute>
          }
        />
        <Route
          path="/chat/:orderId"
          element={
            <PrivateRoute>
              <Chat />
            </PrivateRoute>
          }
        />
        <Route
          path="/create-gig"
          element={
            <FreelancerRoute>
              <CreateGig />
            </FreelancerRoute>
          }
        />
        <Route
          path="/my-gigs"
          element={
            <FreelancerRoute>
              <MyGigs />
            </FreelancerRoute>
          }
        />
        <Route
          path="/edit-gig/:gigId"
          element={
            <FreelancerRoute>
              <CreateGig />
            </FreelancerRoute>
          }
        />

        {/* Admin Dashboard Route */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />

        {/* Default Home Route: Renders the Home component if not logged in, otherwise redirects based on role */}
        <Route
          path="/"
          element={
            // Check for admin role first
            currentUser && userRole === 'admin' ? (
              <Navigate to="/admin" replace /> // Admin goes directly to Admin Panel
            ) : currentUser ? (
              <Navigate to="/dashboard" replace /> // Other logged-in users go to general dashboard redirector
            ) : (
              <Home /> // Not logged in, go to public homepage
            )
          }
        />

        {/* Catch-all Route: If any route is not matched, redirect to Home. */}
        {/* This is simplified to prevent infinite loops from complex Navigate conditions */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </main>
  );
};

// Main App component: Sets up BrowserRouter and global Header/Footer
function App() {
  return (
    <BrowserRouter>
      <Header />
      <AppRoutes />
      <Footer />
    </BrowserRouter>
  );
}

export default App;
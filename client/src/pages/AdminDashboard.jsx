// client/src/pages/AdminDashboard.jsx (Corrected: Remove whitespace in tables)
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { authenticatedFetch } from '../utils/api';

const AdminDashboard = () => {
  const { currentUser, userRole, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('users');
  const [adminData, setAdminData] = useState({ users: [], gigs: [], orders: [] });
  const [dataLoading, setDataLoading] = useState(false);
  const [error, setError] = useState(null);
  const [actionMessage, setActionMessage] = useState('');

  useEffect(() => {
    if (!authLoading) {
      if (!currentUser) {
        navigate('/');
      } else if (userRole !== 'admin') {
        navigate('/dashboard');
      }
    }
  }, [currentUser, userRole, authLoading, navigate]);

  const fetchData = async () => {
    if (!currentUser || userRole !== 'admin') return;

    setDataLoading(true);
    setError(null);
    try {
      let endpoint = '';
      if (activeTab === 'users') {
        endpoint = '/admin/users';
      } else if (activeTab === 'gigs') {
        endpoint = '/admin/gigs';
      } else if (activeTab === 'orders') {
        endpoint = '/admin/orders';
      }

      if (endpoint) {
        const data = await authenticatedFetch(endpoint);
        setAdminData(prev => ({ ...prev, [activeTab]: data }));
      }
    } catch (err) {
      console.error(`Error fetching admin ${activeTab} data:`, err);
      setError(err.message || `Failed to load ${activeTab}.`);
    } finally {
      setDataLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab, currentUser, userRole]);


  const handleUserRoleChange = async (uid, newRole) => {
    if (!window.confirm(`Are you sure you want to change role of ${uid} to ${newRole}?`)) return;
    setActionMessage('');
    try {
      const response = await authenticatedFetch(`/admin/users/${uid}/role`, {
        method: 'PUT',
        body: JSON.stringify({ role: newRole }),
      });
      setActionMessage(response.message || 'Role updated!');
      fetchData();
    } catch (err) {
      console.error('Error updating user role:', err);
      setActionMessage(`Error updating role: ${err.message}`);
    }
  };

  const handleDeleteUser = async (uid, email) => {
    if (!window.confirm(`Are you sure you want to delete user ${email}? This cannot be undone.`)) return;
    setActionMessage('');
    try {
      const response = await authenticatedFetch(`/admin/users/${uid}`, { method: 'DELETE' });
      setActionMessage(response.message || 'User deleted!');
      fetchData();
    } catch (err) {
      console.error('Error deleting user:', err);
      setActionMessage(`Error deleting user: ${err.message}`);
    }
  };

  const handleDeleteGig = async (gigId, title) => {
    if (!window.confirm(`Are you sure you want to delete gig "${title}"? This cannot be undone.`)) return;
    setActionMessage('');
    try {
      const response = await authenticatedFetch(`/admin/gigs/${gigId}`, { method: 'DELETE' });
      setActionMessage(response.message || 'Gig deleted!');
      fetchData();
    } catch (err) {
      console.error('Error deleting gig:', err);
      setActionMessage(`Error deleting gig: ${err.message}`);
    }
  };

  const handleUpdateOrderStatusAdmin = async (orderId, newStatus) => {
    if (!window.confirm(`Set order ${orderId} status to "${newStatus}"?`)) return;
    setActionMessage('');
    try {
      const response = await authenticatedFetch(`/admin/orders/${orderId}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus }),
      });
      setActionMessage(response.message || 'Order status updated!');
      fetchData();
    } catch (err) {
      console.error('Error updating order status:', err);
      setActionMessage(`Error updating status: ${err.message}`);
    }
  };


  if (authLoading) {
    return <div className="min-h-screen flex items-center justify-center text-xl text-gray-700">Loading admin permissions...</div>;
  }

  if (!currentUser || userRole !== 'admin') {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">Admin Dashboard</h1>

      {actionMessage && (
        <div className={`p-3 text-sm rounded-lg mb-4 text-center ${actionMessage.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`} role="alert">
          {actionMessage}
        </div>
      )}
      {error && <div className="p-3 text-sm text-red-700 bg-red-100 rounded-lg mb-4 text-center">{error}</div>}


      {/* Tab Navigation */}
      <div className="flex justify-center border-b border-gray-200 mb-8">
        <button
          onClick={() => setActiveTab('users')}
          className={`py-3 px-6 text-lg font-medium ${activeTab === 'users' ? 'border-b-2 border-fiverr-green text-fiverr-green' : 'text-gray-600 hover:text-gray-800'}`}
        >
          Users
        </button>
        <button
          onClick={() => setActiveTab('gigs')}
          className={`py-3 px-6 text-lg font-medium ${activeTab === 'gigs' ? 'border-b-2 border-fiverr-green text-fiverr-green' : 'text-gray-600 hover:text-gray-800'}`}
        >
          Gigs
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`py-3 px-6 text-lg font-medium ${activeTab === 'orders' ? 'border-b-2 border-fiverr-green text-fiverr-green' : 'text-gray-600 hover:text-gray-800'}`}
        >
          Orders
        </button>
      </div>

      {/* Content Area for Active Tab */}
      <div className="bg-white p-6 rounded-lg shadow-lg">
        {dataLoading ? (
          <div className="text-center text-gray-600 text-xl py-10">Loading {activeTab} data...</div>
        ) : (
          <>
            {activeTab === 'users' && (
              <div>
                <h2 className="text-2xl font-semibold mb-4">Manage Users</h2>
                {adminData.users.length === 0 ? (
                    <p className="text-gray-600">No users found.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-white border border-gray-200">
                            <thead>
                                <tr>
                                    <th className="py-2 px-4 border-b text-left">Email</th>
                                    <th className="py-2 px-4 border-b text-left">Username</th>
                                    <th className="py-2 px-4 border-b text-left">Role</th>
                                    <th className="py-2 px-4 border-b text-left">UID</th>
                                    <th className="py-2 px-4 border-b text-left">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {/* REMOVED WHITESPACE */}
                                {adminData.users.map(user => (<tr key={user.id} className="border-b"><td className="py-2 px-4">{user.email}</td><td className="py-2 px-4">{user.username || 'N/A'}</td><td className="py-2 px-4">{user.role}</td><td className="py-2 px-4 text-xs font-mono">{user.id}</td><td className="py-2 px-4 whitespace-nowrap"><select value={user.role} onChange={(e) => handleUserRoleChange(user.id, e.target.value)} className="border rounded px-2 py-1 text-sm mr-2"><option value="client">Client</option><option value="freelancer">Freelancer</option><option value="admin">Admin</option></select><button onClick={() => handleDeleteUser(user.id, user.email)} className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded-md text-sm">Delete</button></td></tr>))}
                            </tbody>
                        </table>
                    </div>
                )}
              </div>
            )}

            {activeTab === 'gigs' && (
              <div>
                <h2 className="text-2xl font-semibold mb-4">Manage Gigs</h2>
                {adminData.gigs.length === 0 ? (
                    <p className="text-gray-600">No gigs found.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-white border border-gray-200">
                            <thead>
                                <tr>
                                    <th className="py-2 px-4 border-b text-left">Title</th>
                                    <th className="py-2 px-4 border-b text-left">Freelancer</th>
                                    <th className="py-2 px-4 border-b text-left">Price</th>
                                    <th className="py-2 px-4 border-b text-left">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {/* REMOVED WHITESPACE */}
                                {adminData.gigs.map(gig => (<tr key={gig.id} className="border-b"><td className="py-2 px-4">{gig.title}</td><td className="py-2 px-4">{gig.username || 'N/A'}</td><td className="py-2 px-4">${gig.price}</td><td className="py-2 px-4"><button onClick={() => handleDeleteGig(gig.id, gig.title)} className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded-md text-sm">Delete</button></td></tr>))}
                            </tbody>
                        </table>
                    </div>
                )}
              </div>
            )}

            {activeTab === 'orders' && (
              <div>
                <h2 className="text-2xl font-semibold mb-4">Manage Orders</h2>
                {adminData.orders.length === 0 ? (
                    <p className="text-gray-600">No orders found.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full bg-white border border-gray-200">
                            <thead>
                                <tr>
                                    <th className="py-2 px-4 border-b text-left">Order ID</th>
                                    <th className="py-2 px-4 border-b text-left">Gig ID</th>
                                    <th className="py-2 px-4 border-b text-left">Buyer</th>
                                    <th className="py-2 px-4 border-b text-left">Seller</th>
                                    <th className="py-2 px-4 border-b text-left">Price</th>
                                    <th className="py-2 px-4 border-b text-left">Status</th>
                                    <th className="py-2 px-4 border-b text-left">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {/* REMOVED WHITESPACE */}
                                {adminData.orders.map(order => (<tr key={order.id} className="border-b"><td className="py-2 px-4 text-xs font-mono">{order.id}</td><td className="py-2 px-4 text-xs font-mono">{order.gigId}</td><td className="py-2 px-4">{order.buyerUsername || order.buyerId}</td><td className="py-2 px-4">{order.sellerUsername || order.sellerId}</td><td className="py-2 px-4">${order.price}</td><td className="py-2 px-4"><select value={order.status} onChange={(e) => handleUpdateOrderStatusAdmin(order.id, e.target.value)} className="border rounded px-2 py-1 text-sm"><option value="pending">Pending</option><option value="in progress">In progress</option><option value="delivered">Delivered</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option></select></td><td className="py-2 px-4">{/* Delete button placeholder */}</td></tr>))}
                            </tbody>
                        </table>
                    </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
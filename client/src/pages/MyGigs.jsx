// client/src/pages/MyGigs.jsx
import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const MyGigs = () => {
  const { currentUser, userRole, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [myGigs, setMyGigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteMessage, setDeleteMessage] = useState('');

  // Redirect if not logged in or not a freelancer
  useEffect(() => {
    if (!authLoading && (!currentUser || userRole !== 'freelancer')) {
      navigate('/'); // Redirect to home if not authorized
    }
  }, [currentUser, userRole, authLoading, navigate]);

  const fetchMyGigs = async () => {
    if (!currentUser || userRole !== 'freelancer') return;

    setLoading(true);
    setError(null);
    setDeleteMessage('');
    try {
      // Fetch gigs from the backend filtered by current user's ID
      // (You might need a new backend endpoint for /api/gigs/my-gigs/:userId later if filtering all isn't sufficient)
      const response = await fetch(`http://localhost:5000/api/gigs?userId=${currentUser.uid}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      // Filter again client-side just to be safe, though backend should do this
      setMyGigs(data.filter(gig => gig.userId === currentUser.uid));
    } catch (err) {
      console.error("Error fetching my gigs:", err);
      setError("Failed to load your gigs. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyGigs();
  }, [currentUser, userRole, authLoading]); // Re-fetch when user/role changes


  const handleDelete = async (gigId) => {
    if (!window.confirm("Are you sure you want to delete this gig? This action cannot be undone.")) {
      return;
    }
    setDeleteMessage('');
    setLoading(true); // Maybe a specific loading for delete button
    try {
      const response = await fetch(`http://localhost:5000/api/gigs/${gigId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.uid }), // Pass userId for backend authorization
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete gig.');
      }

      setDeleteMessage(`Gig ${gigId} deleted successfully!`);
      fetchMyGigs(); // Refresh the list of gigs
    } catch (err) {
      console.error("Error deleting gig:", err);
      setDeleteMessage(`Error deleting gig: ${err.message}`);
    } finally {
      setLoading(false); // Maybe specific loading for delete button
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xl text-gray-700">
        Loading your gigs...
      </div>
    );
  }

  if (!currentUser || userRole !== 'freelancer') {
    return null; // Redirect handled by useEffect
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xl text-red-500">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">Manage My Gigs</h1>
      <div className="flex justify-end mb-6">
        <Link to="/create-gig" className="bg-fiverr-green hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300">
          Create New Gig
        </Link>
      </div>

      {deleteMessage && (
        <div className={`p-3 text-sm rounded-lg mb-4 ${deleteMessage.includes('Error') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`} role="alert">
          {deleteMessage}
        </div>
      )}

      {myGigs.length === 0 ? (
        <div className="text-center text-gray-600 text-xl mt-10">
          You haven't created any gigs yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {myGigs.map((gig) => (
            <div key={gig.id} className="bg-white rounded-lg shadow-md overflow-hidden p-4 flex items-center justify-between space-x-4 border border-gray-200">
              <img src={gig.images?.[0] || `https://picsum.photos/seed/${gig.id}/100/75`} alt={gig.title} className="w-24 h-16 object-cover rounded-md flex-shrink-0" />
              <div className="flex-grow">
                <h3 className="text-lg font-semibold text-gray-800 line-clamp-1">{gig.title}</h3>
                <p className="text-sm text-gray-600">Price: ${gig.price?.toFixed(0)} | Status: Active</p> {/* Basic status */}
              </div>
              <div className="flex space-x-2 flex-shrink-0">
                <Link
                  to={`/edit-gig/${gig.id}`} // Link to Edit Gig page
                  className="bg-blue-500 hover:bg-blue-600 text-white text-sm py-1 px-3 rounded-md"
                >
                  Edit
                </Link>
                <button
                  onClick={() => handleDelete(gig.id)}
                  className="bg-red-500 hover:bg-red-600 text-white text-sm py-1 px-3 rounded-md"
                  disabled={loading} // Disables button while delete is in progress
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyGigs;
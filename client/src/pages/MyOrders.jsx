// client/src/pages/MyOrders.jsx (Updated for polished UI)
import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import OrderCard from '../components/OrderCard';
import { Link } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore'; // Import for hasReviewed logic
import { db } from '../utils/firebase'; // Firestore instance

const MyOrders = () => {
  const { currentUser, userRole, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [gigDetailsMap, setGigDetailsMap] = useState({});
  const [existingReviews, setExistingReviews] = useState({});

  // Function to fetch gig details for orders (remains unchanged)
  const fetchGigDetailsForOrders = async (orderList) => {
    const gigIds = [...new Set(orderList.map(order => order.gigId))];
    const newGigDetailsMap = {};
    for (const gigId of gigIds) {
      try {
        const response = await fetch(`http://localhost:5000/api/gigs/${gigId}`);
        if (response.ok) {
          const gigData = await response.json();
          newGigDetailsMap[gigId] = {
            title: gigData.title,
            image: gigData.images?.[0] || `https://picsum.photos/seed/${gigId}/150/100`, // Updated placeholder
            sellerUsername: gigData.username
          };
        } else {
          console.warn(`Could not fetch gig details for gigId: ${gigId}`);
          newGigDetailsMap[gigId] = { title: 'Gig Unavailable', image: 'https://via.placeholder.com/150x100?text=Error', sellerUsername: 'N/A' };
        }
      } catch (err) {
        console.error(`Error fetching gig ${gigId}:`, err);
        newGigDetailsMap[gigId] = { title: 'Gig Unavailable', image: 'https://via.placeholder.com/150x100?text=Error', sellerUsername: 'N/A' };
      }
    }
    setGigDetailsMap(prevMap => ({ ...prevMap, ...newGigDetailsMap }));
  };

  // Function to fetch existing reviews by the current user (remains unchanged, but uses db directly now)
  const fetchExistingReviews = async (orderList) => {
      if (!currentUser) return;
      const reviewMapByOrderId = {};

      try {
          // This fetches reviews by the current user from Firestore directly
          const q = query(collection(db, 'reviews'), where('buyerId', '==', currentUser.uid));
          const querySnapshot = await getDocs(q); // Use getDocs from Firestore

          querySnapshot.forEach(doc => {
              const reviewData = doc.data();
              reviewMapByOrderId[reviewData.orderId] = true; // Mark this orderId as reviewed
          });
      } catch (err) {
          console.error("Error fetching user's reviews directly from Firestore:", err);
      }
      setExistingReviews(reviewMapByOrderId);
  };

  // Function to fetch all orders for the current user (remains unchanged)
  const fetchOrders = async () => {
    if (!currentUser || authLoading) return;

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`http://localhost:5000/api/orders/my-orders/${currentUser.uid}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setOrders(data);
      fetchGigDetailsForOrders(data);
      fetchExistingReviews(data);
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError("Failed to load orders. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [currentUser, authLoading]);

  const handleUpdateOrderStatus = async (orderId, newStatus) => {
    if (!currentUser) {
      alert("You must be logged in to update order status.");
      return;
    }
    try {
      const response = await fetch(`http://localhost:5000/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus, userId: currentUser.uid }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update order status.');
      }

      alert(`Order ${orderId} status updated to ${newStatus}!`);
      fetchOrders();
    } catch (err) {
      console.error("Error updating order status:", err);
      alert(`Error updating order status: ${err.message}`);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xl text-gray-700">
        Loading your orders...
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xl text-red-500">
        Please log in to view your orders. <Link to="/login" className="text-blue-600 hover:underline">Login</Link>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xl text-red-500">
        Error: {error}
      </div>
    );
  }

  const clientOrders = orders.filter(order => order.buyerId === currentUser.uid);
  const freelancerOrders = orders.filter(order => order.sellerId === currentUser.uid);

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl"> {/* Consistent max-width with Dashboard */}
      <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">My Orders ({userRole === 'client' ? 'Client' : 'Freelancer'} View)</h1>

      {userRole === 'client' && (
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">My Purchases</h2>
          {clientOrders.length === 0 ? (
            <p className="text-gray-600 text-lg">You haven't purchased any gigs yet.</p>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {clientOrders.map(order => (
                <OrderCard
                  key={order.id}
                  order={{
                      ...order,
                      gigTitle: gigDetailsMap[order.gigId]?.title,
                      gigImage: gigDetailsMap[order.gigId]?.image,
                      sellerUsername: gigDetailsMap[order.gigId]?.sellerUsername,
                      hasReviewed: existingReviews[order.id] // Pass hasReviewed status based on orderId
                  }}
                  onUpdateStatus={handleUpdateOrderStatus}
                  userRole="buyer"
                  onOrderActionComplete={fetchOrders}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {userRole === 'freelancer' && (
        <div>
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">My Sales</h2>
          {freelancerOrders.length === 0 ? (
            <p className="text-gray-600 text-lg">You don't have any sales yet.</p>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {freelancerOrders.map(order => (
                <OrderCard
                  key={order.id}
                  order={{
                      ...order,
                      gigTitle: gigDetailsMap[order.gigId]?.title,
                      gigImage: gigDetailsMap[order.gigId]?.image,
                      buyerUsername: 'Client'
                  }}
                  onUpdateStatus={handleUpdateOrderStatus}
                  userRole="seller"
                  onOrderActionComplete={fetchOrders}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MyOrders;
// client/src/components/OrderCard.jsx (Updated)
import React, { useState } from 'react'; // Import useState
import { Link } from 'react-router-dom';
import LeaveReview from './LeaveReview'; // Import LeaveReview component

const OrderCard = ({ order, onUpdateStatus, userRole, onOrderActionComplete }) => { 
  console.log("--- OrderCard Render Debug ---");
    console.log("Order ID:", order.orderId);
    console.log("Order Status:", order.status);
    console.log("Order hasReviewed prop received:", order.hasReviewed);
    console.log("userRole:", userRole);
    console.log("Is eligible to show button (status check):", ['delivered', 'completed'].includes(order.status));
    console.log("Will button show?", ['delivered', 'completed'].includes(order.status) && order.hasReviewed !== true);
    console.log("-----------------------");// Added onOrderActionComplete
  const gigTitle = order.gigTitle || "Gig Title Not Loaded";
  const gigImage = order.gigImage || "https://via.placeholder.com/150x100?text=Gig+Image";
  const otherPartyName = userRole === 'buyer' ? order.sellerUsername : order.buyerUsername;

  const [showReviewForm, setShowReviewForm] = useState(false); // New state for review form visibility

  const handleStatusChange = (newStatus) => {
    if (window.confirm(`Are you sure you want to change status to "${newStatus}" for order ${order.orderId}?`)) {
      onUpdateStatus(order.orderId, newStatus);
    }
  };

  const handleReviewSuccess = () => {
      setShowReviewForm(false); // Hide form on success
      if(onOrderActionComplete) onOrderActionComplete(); // Trigger refresh in parent
  };

  const statusColors = {
      'pending': 'text-yellow-700 bg-yellow-100',
      'in progress': 'text-blue-700 bg-blue-100',
      'delivered': 'text-purple-700 bg-purple-100',
      'completed': 'text-green-700 bg-green-100',
      'cancelled': 'text-red-700 bg-red-100',
  };

  const statusText = order.status?.charAt(0).toUpperCase() + order.status?.slice(1);

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden p-4 mb-4 flex flex-col border border-gray-200">
      <div className="flex items-center space-x-4">
        <img src={gigImage} alt={gigTitle} className="w-24 h-16 object-cover rounded-md" />

        <div className="flex-grow">
          <h3 className="text-lg font-semibold text-gray-800 line-clamp-1">{gigTitle}</h3>
          <p className="text-sm text-gray-600">Order ID: <span className="font-mono text-xs">{order.orderId}</span></p>
          <p className="text-sm text-gray-600">Price: <span className="font-bold">${order.price?.toFixed(0)}</span></p>
          <p className="text-sm text-gray-600">
            Status: <span className={`font-semibold px-2 py-0.5 rounded-full text-xs ${statusColors[order.status] || 'text-gray-700 bg-gray-100'}`}>{statusText}</span>
          </p>
          <p className="text-sm text-gray-600">
              {userRole === 'buyer' ? 'Seller:' : 'Buyer:'} {otherPartyName || 'Loading...'}
          </p>
        </div>

        <div className="flex flex-col space-y-2">
          {/* Actions for Buyer */}
          {userRole === 'buyer' && order.status === 'delivered' && (
            <button
              onClick={() => handleStatusChange('completed')}
              className="bg-green-500 hover:bg-green-600 text-white text-sm py-1 px-3 rounded"
            >
              Mark as Completed
            </button>
          )}
           {userRole === 'buyer' && ['pending', 'in progress'].includes(order.status) && (
            <button
              onClick={() => handleStatusChange('cancelled')}
              className="bg-red-500 hover:bg-red-600 text-white text-sm py-1 px-3 rounded"
            >
              Cancel Order
            </button>
          )}
          {userRole === 'buyer' && ['delivered', 'completed'].includes(order.status) && order.hasReviewed !== true && (
            <button
                onClick={() => setShowReviewForm(true)}
                className="bg-yellow-500 hover:bg-yellow-600 text-white text-sm py-1 px-3 rounded"
            >
                Leave Review
            </button>
          )}


          {/* Actions for Seller */}
          {userRole === 'seller' && order.status === 'pending' && (
            <button
              onClick={() => handleStatusChange('in progress')}
              className="bg-blue-500 hover:bg-blue-600 text-white text-sm py-1 px-3 rounded"
            >
              Mark as In Progress
            </button>
          )}
          {userRole === 'seller' && order.status === 'in progress' && (
            <button
              onClick={() => handleStatusChange('delivered')}
              className="bg-purple-500 hover:bg-purple-600 text-white text-sm py-1 px-3 rounded"
            >
              Mark as Delivered
            </button>
          )}
          {userRole === 'seller' && ['pending', 'in progress', 'delivered'].includes(order.status) && (
            <button
              onClick={() => handleStatusChange('cancelled')}
              className="bg-red-500 hover:bg-red-600 text-white text-sm py-1 px-3 rounded"
            >
              Cancel Order
            </button>
          )}

          {/* Link to chat (implement chat UI later) */}
          <Link to={`/chat/${order.id}`} className="text-blue-600 hover:underline text-sm text-center">
            Chat
          </Link>
        </div>
      </div>

      {/* Leave Review Form */}
      {showReviewForm && userRole === 'buyer' && (
          <div className="mt-4">
              <LeaveReview
                  gigId={order.gigId}
                  orderId={order.orderId}
                  sellerId={order.sellerId}
                  onReviewSuccess={handleReviewSuccess}
                  onCancel={() => setShowReviewForm(false)}
              />
          </div>
      )}
    </div>
  );
};

export default OrderCard;
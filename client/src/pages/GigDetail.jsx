// client/src/pages/GigDetail.jsx (Updated for Fiverr-like design)
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const GigDetail = () => {
  const { gigId } = useParams();
  const navigate = useNavigate();
  const { currentUser, userRole, loading: authLoading } = useAuth();
  const [gig, setGig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [purchaseMessage, setPurchaseMessage] = useState('');
  const [reviews, setReviews] = useState([]); // State for reviews
  const [mainImage, setMainImage] = useState(''); // State for the main image in the gallery

  // Fetch Gig Details
  useEffect(() => {
    const fetchGig = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`http://localhost:5000/api/gigs/${gigId}`);
        if (!response.ok) {
          if (response.status === 404) {
            navigate('/gigs');
            return;
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setGig(data);
        // Set initial main image
        if (data.images && data.images.length > 0) {
          setMainImage(data.images[0]);
        } else {
          setMainImage(`https://picsum.photos/seed/${data.id}/800/600`); // Placeholder if no images
        }
      } catch (err) {
        console.error("Error fetching gig:", err);
        setError("Failed to load gig details. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (gigId) {
      fetchGig();
    }
  }, [gigId, navigate]);

  // Fetch Reviews for this Gig
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/reviews/${gigId}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setReviews(data);
      } catch (err) {
        console.error("Error fetching reviews:", err);
      }
    };

    if (gigId) {
      fetchReviews();
    }
  }, [gigId]);

  const handlePurchase = async () => {
    if (!currentUser || userRole !== 'client' || !gig) {
      setPurchaseMessage("You must be a client and logged in to purchase a gig.");
      return;
    }

    setPurchaseMessage('Processing order...');
    try {
      const response = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gigId: gig.id,
          buyerId: currentUser.uid,
          sellerId: gig.userId,
          price: gig.price,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create order.');
      }

      const data = await response.json();
      setPurchaseMessage(`Order placed successfully! Order ID: ${data.orderId}`);
      navigate(`/order-success?orderId=${data.orderId}`);
    } catch (err) {
      console.error('Error during purchase:', err);
      setPurchaseMessage(`Purchase failed: ${err.message}`);
    }
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xl text-gray-700">
        Loading...
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

  if (!gig) {
      return (
          <div className="min-h-screen flex items-center justify-center text-xl text-gray-700">
              Gig not found.
          </div>
      );
  }

  // Use a consistent placeholder for user photo if not available
  const userPhotoUrl = gig.userPhoto || `https://picsum.photos/seed/${gig.userId}/50/50`;

  // renderOrderButtonSection remains unchanged (or update its internal structure if needed)
  const renderOrderButtonSection = () => {
      // console.log statements for debugging should be removed after debugging is complete
      if (!currentUser) {
          return (
              <p className="text-center text-gray-600 text-lg mt-6">
                  Please <Link to="/login" className="text-blue-600 hover:underline">log in</Link> to purchase this gig.
              </p>
          );
      }

      if (userRole === 'freelancer') {
          if (currentUser.uid === gig.userId) {
              return (
                  <p className="text-center text-blue-600 text-lg mt-6">
                      You are the owner of this gig.
                  </p>
              );
          } else {
              return (
                  <p className="text-center text-red-600 text-lg mt-6">
                      Freelancers cannot purchase gigs. Please log in as a Client.
                  </p>
              );
          }
      }

      if (userRole === 'client') {
          return (
              <>
                  <button
                      onClick={handlePurchase}
                      className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg text-lg focus:outline-none focus:shadow-outline w-full transition duration-300 ease-in-out transform hover:scale-105"
                  >
                      Continue (${gig.price?.toFixed(0)})
                  </button>
                  {purchaseMessage && <p className="text-center text-sm mt-3 text-gray-700">{purchaseMessage}</p>}
              </>
          );
      }

      return null;
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl"> {/* Increased max-width */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden md:flex"> {/* Added md:flex for side-by-side on medium screens */}

        {/* Left Column: Gig Details (Main Image, Thumbnails, Description, Reviews) */}
        <div className="md:w-3/5 p-6 md:pr-8"> {/* Added md:pr-8 for right padding on desktop */}
          {/* Main Gig Image */}
          <img
            src={mainImage}
            alt={gig.title}
            className="w-full h-96 object-cover rounded-lg mb-4 shadow-md"
          />
          {/* Thumbnail Gallery */}
          <div className="flex space-x-2 overflow-x-auto pb-4 mb-6 border-b border-gray-200"> {/* Added pb and mb for spacing */}
            {gig.images?.map((img, index) => (
              <img
                key={index}
                src={img}
                alt={`${gig.title} ${index + 1}`}
                className={`w-24 h-16 object-cover rounded-md cursor-pointer border-2 ${mainImage === img ? 'border-green-500' : 'border-gray-200'} hover:border-green-500 transition-colors`}
                onClick={() => setMainImage(img)}
              />
            )) || ( // Fallback if no images are present
                <img
                    src={`https://picsum.photos/seed/${gig.id}/800/600`}
                    alt="Default Gig Image"
                    className="w-24 h-16 object-cover rounded-md border-2 border-gray-200"
                    onClick={() => setMainImage(`https://picsum.photos/seed/${gig.id}/800/600`)}
                />
            )}
          </div>

          {/* Freelancer Info (Duplicated from right column for better flow on Fiverr) */}
          <div className="flex items-center mb-6">
            <img
              src={userPhotoUrl}
              alt={gig.username || 'Freelancer'}
              className="w-12 h-12 rounded-full object-cover mr-4 border border-gray-200"
            />
            <div>
              <span className="font-semibold text-xl text-gray-800">{gig.username || 'Unknown Freelancer'}</span> {/* Larger font */}
              <div className="flex items-center text-yellow-500 text-base"> {/* Larger font */}
                <svg className="w-5 h-5 mr-1 fill-current" viewBox="0 0 20 20">
                  <path d="M10 15l-5.878 3.09 1.123-6.545L.487 7.5l6.561-.955L10 1l2.952 5.545 6.561.955-4.742 4.045 1.123 6.545z"/>
                </svg>
                <span className="font-bold mr-1">{gig.rating?.toFixed(1) || 'N/A'}</span>
                <span className="text-gray-500">({gig.numReviews || 0})</span>
              </div>
            </div>
          </div>


          {/* Gig Title (Main Title) */}
          <h1 className="text-3xl font-bold text-gray-900 mb-6"> {/* Moved up, larger font */}
            {gig.title}
          </h1>

          {/* Gig Description */}
          <h3 className="text-2xl font-bold text-gray-800 mb-3 border-t pt-6">About This Gig</h3> {/* Larger, border-t */}
          <p className="text-lg text-gray-700 leading-relaxed mb-8"> {/* Larger text */}
            {gig.description}
          </p>

          {/* Gig Details */}
          <div className="mb-8 border-t border-b border-gray-200 py-6"> {/* Increased padding */}
            <h3 className="text-xl font-bold text-gray-800 mb-4">Gig Details</h3> {/* Added title */}
            <div className="grid grid-cols-2 gap-y-3">
                <span className="text-gray-600 font-medium">Category:</span>
                <span className="text-gray-800 font-semibold">{gig.category}</span>
                {gig.subCategory && (
                  <>
                    <span className="text-gray-600 font-medium">Sub-Category:</span>
                    <span className="text-gray-800 font-semibold">{gig.subCategory}</span>
                  </>
                )}
                <span className="text-gray-600 font-medium">Delivery Time:</span>
                <span className="text-gray-800 font-semibold">{gig.deliveryTime} Days</span>
                <span className="text-gray-600 font-medium">Revisions:</span>
                <span className="text-gray-800 font-semibold">{gig.revisions === -1 ? 'Unlimited' : gig.revisions}</span>
            </div>
          </div>

          {/* Reviews Section */}
          <div className="mt-8 border-t pt-6">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">Reviews ({reviews.length})</h3>
              {reviews.length === 0 ? (
                  <p className="text-gray-600 text-lg">No reviews yet. Be the first!</p>
              ) : (
                  <div className="space-y-6">
                      {reviews.map(review => (
                          <div key={review.id} className="border-b pb-4 last:border-b-0">
                              <div className="flex items-center mb-2">
                                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-semibold text-sm mr-3">
                                      {review.buyerUsername?.charAt(0).toUpperCase()}
                                  </div>
                                  <div>
                                      <p className="font-semibold text-gray-800">{review.buyerUsername}</p>
                                      <div className="flex items-center text-yellow-500 text-sm">
                                          {[1, 2, 3, 4, 5].map((star) => (
                                              <svg
                                                  key={star}
                                                  className={`w-4 h-4 mr-0.5 ${
                                                      star <= review.rating ? 'fill-current' : 'fill-transparent stroke-current stroke-1'
                                                  }`}
                                                  viewBox="0 0 20 20"
                                              >
                                                  <path d="M10 15l-5.878 3.09 1.123-6.545L.487 7.5l6.561-.955L10 1l2.952 5.545 6.561.955-4.742 4.045 1.123 6.545z"/>
                                              </svg>
                                          ))}
                                          <span className="ml-1 text-gray-600">({review.rating})</span>
                                      </div>
                                  </div>
                              </div>
                              <p className="text-gray-700 leading-relaxed text-base">{review.comment}</p> {/* Larger text */}
                              <p className="text-gray-500 text-xs mt-2">
                                  Reviewed on: {
                                      review.createdAt
                                          ? (typeof review.createdAt.toDate === 'function'
                                              ? new Date(review.createdAt.toDate()).toLocaleDateString()
                                              : new Date(review.createdAt).toLocaleDateString())
                                          : 'N/A'
                                  }
                              </p>
                          </div>
                      ))}
                  </div>
              )}
          </div>
        </div>

        {/* Right Column: Price and Order Button (Sticky) */}
        <div className="md:w-2/5 p-6 md:pl-8 border-l border-gray-200">
            <div className="md:sticky md:top-6"> {/* Make it sticky on desktop */}
                {/* Gig Title (Condensed for right column) */}
                <h2 className="text-xl font-bold text-gray-900 mb-4 md:hidden"> {/* Hide on desktop, visible on mobile */}
                    {gig.title}
                </h2>

                <div className="flex justify-between items-center mb-4">
                    <span className="text-gray-500 text-base">STARTING AT</span>
                    <p className="text-4xl font-extrabold text-gray-900">${gig.price?.toFixed(0) || 'N/A'}</p>
                </div>

                <div className="mb-6">
                    <div className="flex items-center text-gray-700 mb-2">
                        <svg className="w-5 h-5 mr-2 text-gray-500" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1-9a1 1 0 000 2h2a1 1 0 100-2h-2z"/></svg>
                        <span className="font-semibold">{gig.deliveryTime} Days Delivery</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                        <svg className="w-5 h-5 mr-2 text-gray-500" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zM9 9a1 1 0 000 2h2a1 1 0 100-2H9z"/></svg>
                        <span className="font-semibold">{gig.revisions === -1 ? 'Unlimited' : gig.revisions} Revisions</span>
                    </div>
                </div>

                {renderOrderButtonSection()} {/* This function remains as is */}
                {purchaseMessage && <p className="text-center text-sm mt-3 text-gray-700">{purchaseMessage}</p>}
            </div>
        </div>
      </div>
    </div>
  );
};

export default GigDetail;
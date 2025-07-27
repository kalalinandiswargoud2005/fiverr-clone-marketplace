// client/src/components/GigCard.jsx (Updated for Fiverr-like design)
import React from 'react';
import { Link } from 'react-router-dom';

const GigCard = ({ gig }) => {
  // Use more robust and varied placeholder images
  const imageUrl = gig.images && gig.images.length > 0
                   ? gig.images[0]
                   : `https://picsum.photos/seed/${gig.id}/400/250`; // Use gig ID as seed for consistent random image
  const username = gig.username || 'Unknown Freelancer';
  const userPhotoUrl = gig.userPhoto || `https://picsum.photos/seed/${gig.userId}/50/50`; // Use user ID as seed for profile photo

  return (
    <Link to={`/gig/${gig.id}`} className="block h-full"> {/* Ensure card is clickable and takes full height */}
      <div className="bg-white rounded overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200 h-full flex flex-col border border-gray-100">
        {/* Gig Image */}
        <img
          src={imageUrl}
          alt={gig.title}
          className="w-full h-40 object-cover object-center" /* Fixed height for consistency */
        />

        <div className="p-3 flex flex-col flex-grow"> {/* Increased padding slightly */}
          {/* Freelancer Info */}
          <div className="flex items-center mb-2"> {/* Reduced margin bottom */}
            <img
              src={userPhotoUrl}
              alt={username}
              className="w-8 h-8 rounded-full object-cover mr-2 border border-gray-200" /* Smaller, subtle border */
            />
            <span className="text-sm font-medium text-gray-700">{username}</span> {/* Slightly lighter text */}
          </div>

          {/* Gig Title */}
          <h3 className="text-base font-semibold text-gray-800 line-clamp-2 mb-2 flex-grow"> {/* Adjusted text size, added flex-grow */}
            {gig.title}
          </h3>

          {/* Rating */}
          <div className="flex items-center text-yellow-500 text-sm mb-2"> {/* Consistent spacing */}
            <svg className="w-4 h-4 mr-1 fill-current" viewBox="0 0 20 20">
              <path d="M10 15l-5.878 3.09 1.123-6.545L.487 7.5l6.561-.955L10 1l2.952 5.545 6.561.955-4.742 4.045 1.123 6.545z"/>
            </svg>
            <span className="font-bold mr-1">{gig.rating?.toFixed(1) || 'N/A'}</span>
            <span className="text-gray-500">({gig.numReviews || 0})</span>
          </div>

          {/* Price */}
          <div className="flex justify-between items-center border-t border-gray-100 pt-3 mt-auto"> {/* Added border-t, mt-auto for bottom alignment */}
            <span className="text-gray-500 text-xs uppercase tracking-wider">STARTING AT</span> {/* Smaller, uppercase text */}
            <span className="text-lg font-bold text-gray-800">${gig.price?.toFixed(0) || 'N/A'}</span> {/* Reduced price font size slightly, text-gray-800 */}
          </div>
        </div>
      </div>
    </Link>
  );
};

export default GigCard;
// client/src/components/LeaveReview.jsx
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext'; // To get currentUser.uid

const LeaveReview = ({ gigId, orderId, sellerId, onReviewSuccess, onCancel }) => {
    const { currentUser } = useAuth();
    const [rating, setRating] = useState(0); // 0-5 stars
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(false);
        setLoading(true);

        if (rating === 0) {
            setError('Please select a rating (1-5 stars).');
            setLoading(false);
            return;
        }
        if (comment.trim() === '') {
            setError('Please provide a comment for your review.');
            setLoading(false);
            return;
        }

        try {
            const reviewData = {
                gigId,
                orderId,
                buyerId: currentUser.uid, // Buyer's UID from authenticated user
                sellerId,
                rating,
                comment: comment.trim(),
            };

            const response = await fetch('http://localhost:5000/api/reviews', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(reviewData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to submit review.');
            }

            setSuccess(true);
            setComment('');
            setRating(0);
            alert("Review submitted successfully!");
            if (onReviewSuccess) {
                onReviewSuccess(); // Callback to refresh orders or close modal
            }
        } catch (err) {
            console.error('Error submitting review:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">Leave a Review</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
                {error && <p className="text-red-500 text-sm">{error}</p>}
                {success && <p className="text-green-600 text-sm">Review submitted successfully!</p>}

                {/* Rating Stars */}
                <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">Rating:</label>
                    <div className="flex items-center">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <svg
                                key={star}
                                className={`w-6 h-6 cursor-pointer ${
                                    star <= rating ? 'text-yellow-500' : 'text-gray-300'
                                }`}
                                fill="currentColor"
                                viewBox="0 0 20 20"
                                onClick={() => setRating(star)}
                            >
                                <path d="M10 15l-5.878 3.09 1.123-6.545L.487 7.5l6.561-.955L10 1l2.952 5.545 6.561.955-4.742 4.045 1.123 6.545z" />
                            </svg>
                        ))}
                    </div>
                </div>

                {/* Comment */}
                <div>
                    <label htmlFor="comment" className="block text-gray-700 text-sm font-bold mb-2">Your Comment:</label>
                    <textarea
                        id="comment"
                        rows="4"
                        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        placeholder="Share your experience with this freelancer and gig..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        required
                    ></textarea>
                </div>

                <div className="flex justify-end space-x-2">
                    {onCancel && (
                        <button
                            type="button"
                            onClick={onCancel}
                            className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded transition duration-300 disabled:opacity-50"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                    )}
                    <button
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition duration-300 disabled:opacity-50"
                        disabled={loading}
                    >
                        {loading ? 'Submitting...' : 'Submit Review'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default LeaveReview;
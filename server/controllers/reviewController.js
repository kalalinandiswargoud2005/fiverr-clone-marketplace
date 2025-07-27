// server/controllers/reviewController.js
const admin = require('firebase-admin'); // Keep this import for admin.firestore.FieldValue

// const db = admin.firestore(); // REMOVE THIS LINE
let db; // Declare db here
let adminInstance; // Declare adminInstance here

exports.initializeFirebaseAdminForReviews = (firebaseAdmin) => {
    adminInstance = firebaseAdmin; // Assign admin instance
    db = firebaseAdmin.firestore(); // Assign db instance here
};

// @desc    Add a review for a gig
// @route   POST /api/reviews
// @access  Private (Client Only - will implement middleware later)
exports.addReview = async (req, res) => {
    try {
        if (!db || !adminInstance) { // Add checks to ensure they are initialized
            throw new Error("Firebase services not initialized in reviewController.");
        }
        const { gigId, buyerId, sellerId, rating, comment } = req.body;

        if (!gigId || !buyerId || !sellerId || !rating || !comment) {
            return res.status(400).json({ message: 'Please provide all required review fields: gigId, buyerId, sellerId, rating, comment.' });
        }
        if (rating < 1 || rating > 5) {
            return res.status(400).json({ message: 'Rating must be between 1 and 5.' });
        }

        const existingReviewSnapshot = await db.collection('reviews')
            .where('gigId', '==', gigId)
            .where('buyerId', '==', buyerId)
            .limit(1)
            .get();

        if (!existingReviewSnapshot.empty) {
            return res.status(409).json({ message: 'You have already reviewed this gig.' });
        }

        const buyerUserDoc = await db.collection('users').doc(buyerId).get();
        const buyerUsername = buyerUserDoc.exists ? (buyerUserDoc.data().username || buyerUserDoc.data().email.split('@')[0]) : 'Anonymous';


        const newReviewRef = db.collection('reviews').doc();
        await newReviewRef.set({
            reviewId: newReviewRef.id,
            gigId,
            buyerId,
            buyerUsername,
            sellerId,
            rating: parseInt(rating),
            comment,
            createdAt: adminInstance.firestore.FieldValue.serverTimestamp(), // Use adminInstance
        });

        const gigRef = db.collection('gigs').doc(gigId);
        await db.runTransaction(async (transaction) => {
            const gigDoc = await transaction.get(gigRef);
            if (!gigDoc.exists) {
                throw new Error("Gig not found during rating update.");
            }
            const gigData = gigDoc.data();
            const currentRatingSum = (gigData.rating || 0) * (gigData.numReviews || 0);
            const newNumReviews = (gigData.numReviews || 0) + 1;
            const newRating = (currentRatingSum + parseInt(rating)) / newNumReviews;

            transaction.update(gigRef, {
                rating: newRating,
                numReviews: newNumReviews,
                updatedAt: adminInstance.firestore.FieldValue.serverTimestamp(), // Use adminInstance
            });
        });

        res.status(201).json({ message: 'Review added successfully!', reviewId: newReviewRef.id });

    } catch (error) {
        console.error('Error adding review:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get all reviews for a specific gig (remains unchanged)
// @route   GET /api/reviews/:gigId
// @access  Public
exports.getGigReviews = async (req, res) => {
    try {
        if (!db) { // Check for db initialization
            throw new Error("Firebase Firestore not initialized in reviewController.");
        }
        const { gigId } = req.params;

        const reviewsSnapshot = await db.collection('reviews')
            .where('gigId', '==', gigId)
            .orderBy('createdAt', 'desc')
            .get();

        const reviews = [];
        reviewsSnapshot.forEach(doc => {
            reviews.push({ id: doc.id, ...doc.data() });
        });

        res.status(200).json(reviews);
    } catch (error) {
        console.error('Error fetching gig reviews:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Get all reviews left by a specific user (buyer) - remains unchanged
// @route   GET /api/reviews/my-reviews/:userId
// @access  Private
exports.getMyReviews = async (req, res) => {
    try {
        if (!db) {
            throw new Error("Firebase Firestore not initialized in reviewController.");
        }
        const { userId } = req.params;

        const reviewsSnapshot = await db.collection('reviews')
            .where('buyerId', '==', userId)
            .orderBy('createdAt', 'desc')
            .get();

        const reviews = [];
        reviewsSnapshot.forEach(doc => {
            reviews.push({ id: doc.id, ...doc.data() });
        });

        res.status(200).json(reviews);
    } catch (error) {
        console.error('Error fetching user reviews:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
// server/middleware/authMiddleware.js
const admin = require('firebase-admin'); // Import Firebase Admin SDK

// Middleware to protect routes (ensure authenticated user)
exports.protect = async (req, res, next) => {
    let idToken;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            idToken = req.headers.authorization.split(' ')[1]; // Get token from header
            const decodedToken = await admin.auth().verifyIdToken(idToken); // Verify token

            req.user = decodedToken; // Attach decoded user info to request

            // Fetch user's role from Firestore and attach to request
            const userDoc = await admin.firestore().collection('users').doc(decodedToken.uid).get();
            if (userDoc.exists) {
                req.user.role = userDoc.data().role; // Add role to req.user
                req.user.username = userDoc.data().username || userDoc.data().email.split('@')[0]; // Add username
                req.user.photoURL = userDoc.data().photoURL || null; // Add photoURL
            } else {
                // User not found in Firestore, possibly partial registration
                req.user.role = null;
            }

            next(); // Proceed to next middleware/route handler
        } catch (error) {
            console.error('Auth middleware error:', error);
            if (error.code === 'auth/id-token-expired') {
                return res.status(401).json({ message: 'Token expired. Please log in again.' });
            }
            res.status(401).json({ message: 'Not authorized, token failed.' });
        }
    }
    if (!idToken) {
        res.status(401).json({ message: 'Not authorized, no token.' });
    }
};

// Middleware to restrict access to admin only
exports.admin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next(); // User is admin, proceed
    } else {
        res.status(403).json({ message: 'Not authorized as an admin.' });
    }
};
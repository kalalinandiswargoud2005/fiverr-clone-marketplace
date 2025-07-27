// server/controllers/userController.js
const admin = require('firebase-admin'); // Keep this import for admin.firestore.FieldValue

// const db = admin.firestore(); // REMOVE THIS LINE
let db; // Declare db here
let adminInstance; // Declare adminInstance here

exports.initializeFirebaseAdminForUsers = (firebaseAdmin) => {
    adminInstance = firebaseAdmin; // Assign admin instance
    db = firebaseAdmin.firestore(); // Assign db instance here
};

// @desc    Check if username is unique
// @route   POST /api/users/check-username
// @access  Public
exports.checkUsername = async (req, res) => {
    try {
        if (!db) { // Add check to ensure db is initialized
            throw new Error("Firebase Firestore not initialized in userController.");
        }
        const { username } = req.body;

        if (!username || username.trim() === '') {
            return res.status(400).json({ message: 'Username is required.' });
        }

        const usersSnapshot = await db.collection('users')
            .where('username', '==', username.trim())
            .limit(1)
            .get();

        if (!usersSnapshot.empty) {
            return res.status(200).json({ isUnique: false, message: 'Username is already taken.' });
        }

        res.status(200).json({ isUnique: true, message: 'Username is available.' });
    } catch (error) {
        console.error('Error checking username:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// @desc    Update user profile (username, role)
// @route   PUT /api/users/:uid
// @access  Private
exports.updateUserProfile = async (req, res) => {
    try {
        if (!db || !adminInstance) { // Add checks to ensure they are initialized
            throw new Error("Firebase services not initialized in userController.");
        }
        const { uid } = req.params;
        const { username, role } = req.body;

        if (!username || username.trim() === '' || !role) {
            return res.status(400).json({ message: 'Username and role are required.' });
        }

        const existingUserWithUsername = await db.collection('users')
            .where('username', '==', username.trim())
            .limit(1)
            .get();

        if (!existingUserWithUsername.empty && existingUserWithUsername.docs[0].id !== uid) {
            return res.status(409).json({ message: 'Username is already taken by another user.' });
        }

        const userRef = db.collection('users').doc(uid);
        await userRef.update({
            username: username.trim(),
            role: role,
            updatedAt: adminInstance.firestore.FieldValue.serverTimestamp(), // Use adminInstance
        });

        res.status(200).json({ message: 'Profile updated successfully!' });
    } catch (error) {
        console.error('Error updating user profile:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
// server/controllers/gigController.js
// DO NOT import admin here directly at the top level
// const admin = require('firebase-admin'); // REMOVE THIS LINE
// const db = admin.firestore(); // REMOVE THIS LINE
// const bucket = admin.storage().bucket(); // REMOVE THIS LINE

let db; // Declare db variable
let bucket; // Declare bucket variable
let adminInstance; // Declare adminInstance to get FieldValue.serverTimestamp()

// Function to initialize Firebase instances for the controller
// This will be called from server.js AFTER admin.initializeApp()
exports.initializeFirebase = (firebaseAdmin) => {
    adminInstance = firebaseAdmin;
    db = firebaseAdmin.firestore();
    bucket = firebaseAdmin.storage().bucket();
};


// @desc    Create a new gig
// @route   POST /api/gigs
// @access  Private (Freelancer Only - implement middleware later)
exports.createGig = async (req, res) => {
  try {
    if (!db || !adminInstance) { // Add a check to ensure db is initialized
        throw new Error("Firebase services not initialized in gigController.");
    }
    const {
      title,
      description,
      category,
      subCategory,
      price,
      deliveryTime,
      revisions,
      images, // Expecting array of image URLs
      userId, // The ID of the freelancer creating the gig (should come from authenticated user)
      username, // Freelancer's username (should come from authenticated user's profile)
      userPhoto, // Freelancer's photo (should come from authenticated user's profile)
    } = req.body;

    // Basic validation
    if (!title || !description || !category || !price || !deliveryTime || !userId) {
      return res.status(400).json({ message: 'Please fill all required fields.' });
    }

    // Add the gig to Firestore
    const newGigRef = db.collection('gigs').doc(); // Create a new document with auto-generated ID
    await newGigRef.set({
      gigId: newGigRef.id, // Store the document ID within the document
      title,
      description,
      category,
      subCategory: subCategory || null,
      price: parseFloat(price), // Ensure price is a number
      deliveryTime: parseInt(deliveryTime), // Ensure deliveryTime is a number
      revisions: parseInt(revisions),
      images: images || [], // Store array of URLs
      userId,
      username,
      userPhoto: userPhoto || null,
      rating: 0, // Initial rating
      numReviews: 0, // Initial reviews count
      createdAt: adminInstance.firestore.FieldValue.serverTimestamp(), // Use adminInstance here
      updatedAt: adminInstance.firestore.FieldValue.serverTimestamp(), // Use adminInstance here
    });

    res.status(201).json({ message: 'Gig created successfully!', gigId: newGigRef.id });
  } catch (error) {
    console.error('Error creating gig:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all gigs
// @route   GET /api/gigs
// @access  Public
exports.getAllGigs = async (req, res) => {
  try {
    if (!db) { // Add a check
        throw new Error("Firebase services not initialized in gigController.");
    }
    const gigsSnapshot = await db.collection('gigs').orderBy('createdAt', 'desc').get();
    const gigs = [];
    gigsSnapshot.forEach(doc => {
      gigs.push({ id: doc.id, ...doc.data() });
    });
    res.status(200).json(gigs);
  } catch (error) {
    console.error('Error fetching gigs:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get single gig by ID
// @route   GET /api/gigs/:id
// @access  Public
exports.getGigById = async (req, res) => {
  try {
    if (!db) { // Add a check
        throw new Error("Firebase services not initialized in gigController.");
    }
    const gigId = req.params.id;
    const gigDoc = await db.collection('gigs').doc(gigId).get();

    if (!gigDoc.exists) {
      return res.status(404).json({ message: 'Gig not found' });
    }

    res.status(200).json({ id: gigDoc.id, ...gigDoc.data() });
  } catch (error) {
    console.error('Error fetching gig by ID:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update a gig
// @route   PUT /api/gigs/:id
// @access  Private (Freelancer who owns the gig - implement middleware later)
exports.updateGig = async (req, res) => {
  try {
    if (!db || !adminInstance) { // Add a check
        throw new Error("Firebase services not initialized in gigController.");
    }
    const gigId = req.params.id;
    const {
      title,
      description,
      category,
      subCategory,
      price,
      deliveryTime,
      revisions,
      images
    } = req.body;

    const gigDoc = await db.collection('gigs').doc(gigId).get();
    if (!gigDoc.exists) {
        return res.status(404).json({ message: 'Gig not found' });
    }

    const updateData = {
      title,
      description,
      category,
      subCategory: subCategory || null,
      price: price ? parseFloat(price) : gigDoc.data().price,
      deliveryTime: deliveryTime ? parseInt(deliveryTime) : gigDoc.data().deliveryTime,
      revisions: revisions ? parseInt(revisions) : gigDoc.data().revisions,
      images: images || gigDoc.data().images,
      updatedAt: adminInstance.firestore.FieldValue.serverTimestamp(), // Use adminInstance here
    };

    await db.collection('gigs').doc(gigId).update(updateData);
    res.status(200).json({ message: 'Gig updated successfully!' });
  } catch (error) {
    console.error('Error updating gig:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete a gig
// @route   DELETE /api/gigs/:id
// @access  Private (Freelancer who owns the gig or Admin - implement middleware later)
exports.deleteGig = async (req, res) => {
  try {
    if (!db) { // Add a check
        throw new Error("Firebase services not initialized in gigController.");
    }
    const gigId = req.params.id;

    const gigDoc = await db.collection('gigs').doc(gigId).get();
    if (!gigDoc.exists) {
        return res.status(404).json({ message: 'Gig not found' });
    }

    await db.collection('gigs').doc(gigId).delete();
    res.status(200).json({ message: 'Gig deleted successfully!' });
  } catch (error) {
    console.error('Error deleting gig:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
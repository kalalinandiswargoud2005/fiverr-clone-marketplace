// client/src/context/AuthContext.js
import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '../utils/firebase'; // Ensure 'auth' and 'db' are exported from firebase.js
import { onAuthStateChanged } from 'firebase/auth'; // Firebase Auth listener
import { doc, getDoc } from 'firebase/firestore'; // Firestore methods to fetch user role

// Create the Auth Context
const AuthContext = createContext();

// Custom hook to easily consume the Auth Context
export const useAuth = () => {
  return useContext(AuthContext);
};

// Auth Provider component to wrap your application
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true); // To indicate if auth state is still being determined

  useEffect(() => {
    // This Firebase listener runs whenever the auth state changes (login, logout, refresh)
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user); // Set the Firebase user object

      if (user) {
        // If a user is logged in, fetch their custom role from Firestore
        const userDocRef = doc(db, 'users', user.uid);
        try {
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            setUserRole(userDoc.data().role); // Set the 'client' or 'freelancer' role
          } else {
            console.warn("User document not found in Firestore for UID:", user.uid);
            setUserRole(null); // Or handle this case as an error/unassigned role
          }
        } catch (firestoreErr) {
          console.error("Error fetching user role from Firestore:", firestoreErr);
          setUserRole(null);
        }
      } else {
        // If no user (logged out), clear the role
        setUserRole(null);
      }
      setLoading(false); // Auth state determination is complete
    });

    // Cleanup the subscription when the component unmounts
    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userRole,
    loading,
    // You can add login/logout functions here if you want them centralized
  };

  // Only render children when the authentication state has been determined
  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
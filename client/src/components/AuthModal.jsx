// client/src/components/AuthModal.jsx (Ensure ALL hooks are at the top)
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../utils/firebase';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp, getDoc } from 'firebase/firestore';

const AuthModal = ({ show, onClose, initialMode = 'login', onAuthSuccess }) => {
  // --- ALL HOOK CALLS MUST BE AT THE VERY TOP LEVEL ---
  const [mode, setMode] = useState(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('client');
  // Removed username states per your request (Step 16.4)
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Effect 1: Reset form state when modal opens/changes mode
  useEffect(() => {
    setMode(initialMode);
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setRole('client');
    setError('');
    setLoading(false);
  }, [initialMode, show]); // Depend on initialMode and show props

  // REMOVED: useEffect for debounced username check (per your request in Step 16.4)

  // --- NOW, after ALL HOOKS, you can have conditional returns ---
  if (!show) return null; // This return is now safe


  // --- All other functions (handleLoginSubmit, handleRegisterSubmit, handleGoogleSignIn) below this point ---
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const userDocRef = doc(db, 'users', user.uid);
      const userDocSnap = await getDoc(userDocRef);
      if (!userDocSnap.exists()) {
          await setDoc(userDocRef, {
              uid: user.uid,
              email: user.email,
              role: 'client',
              createdAt: serverTimestamp(),
              username: user.email.split('@')[0],
          }, { merge: true });
      }

      if (onAuthSuccess) onAuthSuccess(user.uid, false);
      onClose();
    } catch (err) {
      console.error("Login error:", err);
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError('Invalid email or password. Please try again.');
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      setLoading(false);
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: user.email,
        role: role,
        createdAt: serverTimestamp(),
        username: user.email.split('@')[0], // Username derived from email
      });
      if (onAuthSuccess) onAuthSuccess(user.uid, true);
      onClose();
    } catch (err) {
      console.error("Registration error:", err);
      if (err.code === 'auth/email-already-in-use') {
        setError('This email is already registered. Please log in or use a different email.');
      } else if (err.code === 'auth/weak-password') {
        setError('Password is too weak. Please choose a stronger password (min 6 characters).');
      } else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const user = userCredential.user;
      
      const isNewUser = userCredential.additionalUserInfo && userCredential.additionalUserInfo.isNewUser;

      const userDocRef = doc(db, 'users', user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (!userDocSnap.exists()) {
        await setDoc(userDocRef, {
          uid: user.uid,
          email: user.email,
          role: 'client', // Default to client for social sign-up
          createdAt: serverTimestamp(),
          username: user.displayName || user.email.split('@')[0],
          photoURL: user.photoURL || null,
        });
      } else {
        const existingData = userDocSnap.data();
        await setDoc(userDocRef, {
          username: user.displayName || existingData.username || user.email.split('@')[0],
          photoURL: user.photoURL || existingData.photoURL || null,
          email: user.email,
        }, { merge: true });
      }

      if (onAuthSuccess) onAuthSuccess(user.uid, isNewUser);
      onClose();
    } catch (err) {
      console.error("Google Sign-in error:", err);
      if (err.code === 'auth/popup-closed-by-user') {
        setError('Google Sign-in was cancelled.');
      } else if (err.code === 'auth/cancelled-popup-request') {
          setError('Popup blocked by browser. Please allow popups for this site.');
      } else if (err.code === 'auth/account-exists-with-different-credential') {
          setError('An account with this email already exists using a different sign-in method.');
      }
      else {
        setError(err.message);
      }
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[1000]">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-2xl font-bold"
        >
          &times;
        </button>

        <h2 className="text-2xl font-bold text-center mb-6">
          {mode === 'login' ? 'Sign in to your account' : 'Create a new account'}
        </h2>

        {error && (
          <div className="p-3 text-sm text-red-700 bg-red-100 rounded-lg mb-4" role="alert">
            {error}
          </div>
        )}

        {/* Social Login Options */}
        <div className="space-y-3 mb-6">
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            <img src="https://icon2.cleanpng.com/lnd/20241121/sc/bd7ce03eb1225083f951fc01171835.webp" alt="Google" className="w-5 h-5 mr-2" />
            {loading ? 'Processing...' : 'Continue with Google'}
          </button>
          <button className="w-full flex items-center justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50" disabled={loading}>
            <img src="https://icon2.cleanpng.com/lnd/20240923/vo/f4eebad801de63eb0b299f40641e74.webp" alt="Facebook" className="w-5 h-5 mr-2" />
            Continue with Facebook
          </button>
        </div>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">
              OR
            </span>
          </div>
        </div>

        {/* Email/Password Form */}
        <form onSubmit={mode === 'login' ? handleLoginSubmit : handleRegisterSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email address
            </label>
            <div className="mt-1">
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <div className="mt-1">
              <input
                id="password"
                name="password"
                type="password"
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
              />
            </div>
          </div>

          {mode === 'register' && (
            <>
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Confirm Password
                </label>
                <div className="mt-1">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Join as a...
                </label>
                <div className="mt-2 space-y-2">
                  <div className="flex items-center">
                    <input
                      id="client-role"
                      name="role"
                      type="radio"
                      value="client"
                      checked={role === 'client'}
                      onChange={(e) => setRole(e.target.value)}
                      className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                    />
                    <label htmlFor="client-role" className="ml-2 block text-sm text-gray-900">
                      Client (I want to hire a freelancer)
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      id="freelancer-role"
                      name="role"
                      type="radio"
                      value="freelancer"
                      checked={role === 'freelancer'}
                      onChange={(e) => setRole(e.target.value)}
                      className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                    />
                    <label htmlFor="freelancer-role" className="ml-2 block text-sm text-gray-900">
                      Freelancer (I want to offer services)
                    </label>
                  </div>
                </div>
              </div>
            </>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
            >
              {loading ? (mode === 'login' ? 'Signing In...' : 'Creating Account...') : (mode === 'login' ? 'Sign in' : 'Join Now')}
            </button>
          </div>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          {mode === 'login' ? "Don't have an account?" : "Already have an account?"}{' '}
          <button
            onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
            className="font-medium text-blue-600 hover:text-blue-500"
          >
            {mode === 'login' ? 'Join here' : 'Login here'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default AuthModal;
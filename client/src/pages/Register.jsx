// client/src/pages/Register.jsx (Updated for polished UI)
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth, db } from '../utils/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('client'); // Default role
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
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
        username: email.split('@')[0], // Basic username from email
      });

      // No alert here, relying on automatic redirect and AuthContext setting user
      navigate('/dashboard'); // Redirect to dashboard
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

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8"> {/* Lighter background */}
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Create Your Fiverr Account
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-md sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="p-3 text-sm text-red-700 bg-red-100 rounded-lg" role="alert">
                {error}
              </div>
            )}
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
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
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
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>

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

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
              >
                {loading ? 'Creating Account...' : 'Join Now'}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Or continue with
                </span>
              </div>
            </div>
            {/* Social Login placeholders can go here */}
            <div className="mt-6 grid grid-cols-1 gap-3">
              {/* Example: Google Button */}
              {/* <button className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                <svg className="w-5 h-5 mr-2" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.61-6.61C33.62 3.86 29.11 2 24 2 15.65 2 8.35 6.09 3.96 12.01l7.85 6.13C13.41 12.55 18.25 9.5 24 9.5z"/><path fill="#34A853" d="M46.7 24.5h-2.7v-2.7h-2.7V24h-2.7V24.5h-2.7V27h-2.7v2.7h2.7v2.7h2.7V31h2.7v-2.7h2.7V27h2.7V24.5z"/><path fill="#4285F4" d="M43.6 24.5c0-.62-.06-1.22-.17-1.81H24v3.57h10.97c-.47 2.05-1.93 3.79-3.9 4.96l5.77 4.5c3.27-2.92 5.17-7.39 5.17-12.22z"/><path fill="#FBBC04" d="M12.21 28.52c-.93-2.78-.93-5.74 0-8.52L4.36 12.01C1.52 16.34 2.11 22.09 4.36 26.52l7.85-6.13z"/></svg>
                Google
              </button> */}
            </div>
          </div>

          <p className="mt-6 text-center text-sm text-gray-500">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-green-600 hover:text-green-500">
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
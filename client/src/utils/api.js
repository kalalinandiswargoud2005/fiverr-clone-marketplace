// client/src/utils/api.js
import { auth } from './firebase'; // Import Firebase Auth instance

const API_BASE_URL = 'http://localhost:5000/api'; // Your backend API base URL

export const authenticatedFetch = async (endpoint, options = {}) => {
    try {
        const user = auth.currentUser;
        if (!user) {
            throw new Error('User not authenticated.');
        }
        const idToken = await user.getIdToken(); // Get Firebase ID Token

        const headers = {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${idToken}`, // Add Authorization header
            ...options.headers, // Allow overriding headers
        };

        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers,
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Something went wrong.' }));
            throw new Error(errorData.message || 'API request failed.');
        }

        return response.json();
    } catch (error) {
        console.error('Authenticated API call error:', error);
        throw error;
    }
};
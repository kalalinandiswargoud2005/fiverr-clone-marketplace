// client/src/pages/OrderSuccess.jsx (Updated to look for orderId)
import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const OrderSuccess = () => {
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const orderId = queryParams.get('orderId'); // Now looking for orderId

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md text-center">
                <svg className="mx-auto h-24 w-24 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h2 className="text-3xl font-bold text-green-700 mt-4 mb-2">Order Placed Successfully!</h2>
                <p className="text-gray-700 text-lg mb-4">Your request has been sent to the freelancer.</p>
                {orderId && (
                    <p className="text-gray-500 text-sm mb-6">
                        Order ID: <span className="font-mono font-semibold">{orderId}</span>
                    </p>
                )}
                <Link
                    to="/dashboard"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition duration-300 ease-in-out"
                >
                    Go to Dashboard
                </Link>
                <Link
                    to="/gigs"
                    className="ml-4 text-blue-600 hover:underline py-2 px-6"
                >
                    Browse More Gigs
                </Link>
            </div>
        </div>
    );
};

export default OrderSuccess;
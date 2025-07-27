// client/src/pages/Chat.jsx
import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { io } from 'socket.io-client';
import { useAuth } from '../context/AuthContext';
import { collection, query, orderBy, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { db } from '../utils/firebase';

let socket; // Declare socket outside component to persist across re-renders

const Chat = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const { currentUser, userRole, loading: authLoading } = useAuth();

    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [chatDetails, setChatDetails] = useState(null); // Stores buyerId, sellerId, gigId (if new chat)
    const [gigDetails, setGigDetails] = useState(null); // Stores gigTitle, gigImage
    const [chatLoading, setChatLoading] = useState(true);
    const [chatError, setChatError] = useState(null);

    const messagesEndRef = useRef(null); // For auto-scrolling to latest message

    // --- Fetch Chat Details & Gig Details ---
    useEffect(() => {
        const fetchChatAndGigDetails = async () => {
            if (!currentUser || authLoading) return; // Wait for user data
            if (!orderId) {
                navigate('/my-orders'); // Redirect if no orderId
                return;
            }
            setChatLoading(true);
            setChatError(null);
            try {
                // Fetch chat document (might not exist yet if it's the first message)
                const chatDocRef = doc(db, 'chats', orderId);
                const chatDocSnap = await getDoc(chatDocRef);
                let currentChatData = null;

                if (chatDocSnap.exists()) {
                    currentChatData = chatDocSnap.data();
                } else {
                    // If chat doesn't exist, try to get buyer/seller IDs and gigId from the order itself
                    const orderDocSnap = await getDoc(doc(db, 'orders', orderId));
                    if (!orderDocSnap.exists()) {
                        setChatError("Associated order not found for this chat.");
                        setChatLoading(false);
                        return;
                    }
                    const orderData = orderDocSnap.data();
                    currentChatData = {
                        buyerId: orderData.buyerId,
                        sellerId: orderData.sellerId,
                        orderId: orderId, // Set orderId for the chatDetails state
                        gigId: orderData.gigId // Store gigId from order if chat doesn't exist yet
                    };
                }

                // Authorization Check - crucial that this happens *after* getting chatData/orderData
                if (currentUser.uid !== currentChatData.buyerId && currentUser.uid !== currentChatData.sellerId) {
                    setChatError("You are not authorized to view this chat.");
                    setChatLoading(false);
                    return;
                }

                setChatDetails(currentChatData); // Set the chat details for the component

                // Fetch gig details using gigId from either existing chatData or orderData
                const actualGigId = currentChatData.gigId || (await getDoc(doc(db, 'orders', orderId))).data().gigId;
                if (actualGigId) {
                    const gigDocSnap = await getDoc(doc(db, 'gigs', actualGigId));
                    if (gigDocSnap.exists()) {
                        setGigDetails({
                            id: actualGigId, // Ensure gig ID is passed for Link
                            title: gigDocSnap.data().title,
                            image: gigDocSnap.data().images?.[0] || `https://picsum.photos/seed/${actualGigId}/100/75`,
                            sellerUsername: gigDocSnap.data().username || 'Freelancer', // Get seller's username
                            // Add buyer's username here if needed for freelancer view
                        });
                    }
                }

            } catch (err) {
                console.error("Error fetching chat/order/gig details:", err);
                if (err.code === 'permission-denied') {
                     setChatError("Access denied. Please check your permissions and ensure the order exists.");
                } else {
                     setChatError("Failed to load chat details. Please try again.");
                }
            } finally {
                setChatLoading(false);
            }
        };

        fetchChatAndGigDetails(); // Call function inside useEffect
    }, [orderId, currentUser, userRole, authLoading, navigate]); // Added userRole to dependencies


    // --- Socket.IO Connection and Message Listener ---
    useEffect(() => {
        if (!currentUser || !chatDetails || chatError) return; // Wait for user and chat details, don't connect if error

        // Initialize socket connection only once per component instance
        if (!socket || !socket.connected) {
            socket = io('http://localhost:5000');
        }

        // Remove old listeners to prevent duplicates (important for hot-reloading)
        socket.off('connect');
        socket.off('receive_message');
        socket.off('disconnect');
        socket.off('connect_error');

        socket.on('connect', () => {
            console.log('Socket Connected!', socket.id);
            socket.emit('join_chat', orderId); // Join the specific chat room
        });

        socket.on('receive_message', (message) => {
            console.log('Message received:', message);
            setMessages((prevMessages) => {
                if (!prevMessages.some(m => m.messageId === message.messageId)) {
                    const msgWithDate = {
                        ...message,
                        timestamp: message.timestamp ? (typeof message.timestamp.toDate === 'function' ? message.timestamp.toDate() : new Date(message.timestamp)) : new Date()
                    };
                    return [...prevMessages, msgWithDate].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
                }
                return prevMessages;
            });
        });

        socket.on('disconnect', () => {
            console.log('Socket Disconnected!');
        });

        socket.on('connect_error', (err) => {
            console.error('Socket connection error:', err);
            setChatError('Failed to connect to chat server.');
        });

        // Clean up on component unmount
        return () => {
            // For development, keep socket connected if not specifically leaving chat context.
            // For production, consider disconnecting more aggressively on component unmount
            if (socket) {
                socket.off('receive_message');
                socket.off('connect');
                socket.off('disconnect');
                socket.off('connect_error');
                // If you want to strictly disconnect on unmount from Chat.jsx, uncomment:
                // socket.disconnect();
                // socket = null;
            }
        };
    }, [orderId, currentUser, chatDetails, chatError]);


    // --- Firestore Real-time Message History Listener ---
    useEffect(() => {
        if (!chatDetails || chatError) return; // Wait for chat details, don't listen if error

        const messagesRef = collection(db, 'chats', orderId, 'messages');
        const q = query(messagesRef, orderBy('timestamp'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedMessages = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                timestamp: doc.data().timestamp ? (typeof doc.data().timestamp.toDate === 'function' ? doc.data().timestamp.toDate() : new Date(doc.data().timestamp)) : new Date()
            }));
            fetchedMessages.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
            setMessages(fetchedMessages);
        }, (error) => {
            console.error("Error fetching real-time messages from Firestore snapshot:", error);
            setChatError("Failed to load message history from Firestore.");
        });

        return unsubscribe; // Unsubscribe from listener on cleanup
    }, [orderId, chatDetails, chatError]);

    // --- Auto-scroll to bottom of messages ---
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const sendMessage = () => {
        if (newMessage.trim() === '' || !socket || !currentUser || !chatDetails) return;

        const messageData = {
            orderId: orderId,
            senderId: currentUser.uid,
            content: newMessage.trim(),
            // timestamp will be added by server by Firebase FieldValue.serverTimestamp()
        };

        socket.emit('send_message', messageData);
        setNewMessage('');
    };

    if (authLoading || chatLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center text-xl text-gray-700">
                Loading chat...
            </div>
        );
    }

    if (chatError) {
        return (
            <div className="min-h-screen flex items-center justify-center text-xl text-red-500">
                Error: {chatError} <Link to="/my-orders" className="text-blue-600 hover:underline">Go to My Orders</Link>
            </div>
        );
    }

    // Final authorization check before rendering the chat UI
    if (!currentUser || (chatDetails && currentUser.uid !== chatDetails.buyerId && currentUser.uid !== chatDetails.sellerId)) {
        return (
            <div className="min-h-screen flex items-center justify-center text-xl text-red-500">
                You are not authorized to view this chat. <Link to="/my-orders" className="text-blue-600 hover:underline">Go to My Orders</Link>
            </div>
        );
    }

    // Determine chat partner's display name
    let chatPartnerName = 'User';
    if (gigDetails) {
        if (userRole === 'client' && gigDetails.sellerUsername) {
            chatPartnerName = gigDetails.sellerUsername;
        } else if (userRole === 'freelancer' && chatDetails.buyerId) {
            // For freelancer view, need to fetch buyer's username from users collection
            // This is a common enhancement: fetch user profiles for chat partners
            chatPartnerName = `Client ${chatDetails.buyerId.substring(0, 4)}...`; // Placeholder
        }
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-2xl min-h-[calc(100vh-64px)] flex flex-col">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden flex-grow flex flex-col">
                {/* Chat Header */}
                <div className="bg-gray-100 p-4 border-b border-gray-200 flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800">Chat for:</h3>
                        {gigDetails ? (
                            <Link to={`/gig/${gigDetails.id}`} className="flex items-center text-blue-600 hover:underline">
                                <img src={gigDetails.image} alt={gigDetails.title} className="w-10 h-8 object-cover rounded mr-2" />
                                <span className="font-medium">{gigDetails.title}</span>
                            </Link>
                        ) : (
                            <span className="font-medium text-gray-600">Order ID: {orderId}</span>
                        )}
                    </div>
                    <span className="text-sm text-gray-500">
                        Talking to: <span className="font-semibold text-gray-800">{chatPartnerName}</span>
                    </span>
                </div>

                {/* Messages Display Area */}
                <div className="flex-grow p-4 overflow-y-auto custom-scrollbar">
                    {messages.length === 0 ? (
                        <div className="text-center text-gray-500 py-10">No messages yet. Start the conversation!</div>
                    ) : (
                        messages.map((msg, index) => (
                            <div
                                key={msg.id || index}
                                className={`flex mb-4 ${isSender(msg.senderId) ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[70%] p-3 rounded-lg ${
                                        isSender(msg.senderId)
                                            ? 'bg-blue-500 text-white rounded-br-none'
                                            : 'bg-gray-200 text-gray-800 rounded-bl-none'
                                    }`}
                                >
                                    <p className="text-sm">{msg.content}</p>
                                    <span className={`text-xs mt-1 block ${isSender(msg.senderId) ? 'text-blue-100' : 'text-gray-500'}`}>
                                        {msg.timestamp ? new Date(msg.timestamp).toLocaleString() : 'Sending...'}
                                    </span>
                                </div>
                            </div>
                        ))
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <div className="p-4 border-t border-gray-200 bg-gray-50">
                    <div className="flex">
                        <input
                            type="text"
                            className="flex-grow p-3 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Type your message..."
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                            disabled={!currentUser}
                        />
                        <button
                            onClick={sendMessage}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-r-lg transition duration-300 ease-in-out disabled:opacity-50"
                            disabled={!currentUser || newMessage.trim() === ''}
                        >
                            Send
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Chat;
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import EmojiPicker from 'emoji-picker-react';
import './Chat.css';

const Chat = () => {
    const [tickets, setTickets] = useState([]);
    const [closedTickets, setClosedTickets] = useState([]);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [newMessage, setNewMessage] = useState('');
    const [chatMessages, setChatMessages] = useState({});
    const [subject, setSubject] = useState('');
    const [description, setDescription] = useState('');
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);

    useEffect(() => {
        fetchTickets();
    }, []);

    const fetchTickets = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/helpdesk-tickets`);
            const openTickets = response.data.filter(ticket => ticket.status !== 'Closed');
            const closedTickets = response.data.filter(ticket => ticket.status === 'Closed');
            setTickets(openTickets);
            setClosedTickets(closedTickets);
        } catch (error) {
            console.error("Error fetching tickets:", error);
        }
    };

    const onEmojiClick = (emojiData) => {
        setNewMessage((prevMessage) => prevMessage + emojiData.emoji);
    };

    const handleFileChange = (e) => {
        setSelectedFile(e.target.files[0]);
    };

    const handleCreateTicket = async () => {
        if (!subject.trim() || !description.trim()) {
            alert("Please enter both a subject and a description.");
            return;
        }

        try {
            const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/helpdesk-tickets`, {
                subject,
                description,
                status: "New",
            });

            if (response.status === 201) {
                const newTicket = response.data;
                setTickets([...tickets, newTicket]);
                setSelectedTicket(newTicket);
                setSubject('');
                setDescription('');
            } else {
                throw new Error("Failed to create the ticket.");
            }
        } catch (error) {
            console.error("Error creating ticket:", error);
        }
    };

    const handleTicketClick = (ticket) => {
        setSelectedTicket(ticket);
        fetchChatMessages(ticket._id);
    };

    const toggleChatVisibility = () => {
        if (selectedTicket) {
            // Remove the selected ticket from the list when chat is closed
            setTickets((prevTickets) =>
                prevTickets.filter((ticket) => ticket._id !== selectedTicket._id)
            );
            setSelectedTicket(null); // Clear selected ticket
        }
    };

    const fetchChatMessages = async (ticketId) => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/helpdesk-tickets/${ticketId}/chat`, {
                headers: {
                    Authorization: `Bearer ${sessionStorage.getItem('token')}`,
                },
            });
            setChatMessages((prevChats) => ({
                ...prevChats,
                [ticketId]: response.data,
            }));
        } catch (error) {
            console.error("Error fetching chat messages:", error);
        }
    };

    const sendChatMessage = async () => {
        if (!newMessage.trim() || !selectedTicket) return;

        try {
            const response = await axios.post(
                `${process.env.REACT_APP_API_URL}/api/helpdesk-tickets/${selectedTicket._id}/chat`,
                {
                    sender: "User",
                    message: newMessage,
                }
            );

            if (response.status === 200) {
                fetchChatMessages(selectedTicket._id);
                setNewMessage('');
            }
        } catch (error) {
            console.error("Error sending message:", error);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            sendChatMessage();
        }
    };

    const closeTicket = async () => {
        if (selectedTicket) {
            try {
                const response = await axios.patch(
                    `${process.env.REACT_APP_API_URL}/api/helpdesk-tickets/${selectedTicket._id}`,
                    { status: 'Closed' }
                );

                if (response.status === 200) {
                    setTickets((prevTickets) =>
                        prevTickets.filter((ticket) => ticket._id !== selectedTicket._id)
                    );
                    setClosedTickets((prevClosedTickets) => [
                        ...prevClosedTickets,
                        { ...selectedTicket, status: 'Closed' },
                    ]);
                    setSelectedTicket(null); // Clear selected ticket
                    alert("Ticket has been closed.");
                }
            } catch (error) {
                console.error("Error closing the ticket:", error);
            }
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString(); // Adjust format as needed
    };
    const user = JSON.parse(sessionStorage.getItem("user"));
    const fullName = user?.fullName;
    const role = sessionStorage.getItem("role");

    return (
        <div className="chat-container">
            <div className="ticket-list">
        
                <h3>Closed Tickets</h3>
                {closedTickets
        .filter((ticket) => {
          // Jika admin, tampilkan semua tiket
          if (role === "admin") return true;

          // Jika bukan admin, hanya tampilkan tiket yang dibuat oleh pengguna login
          return ticket.createdBy?.fullName === fullName;
        })
                .map((ticket) => (
                    <div
                        key={ticket._id}
                        className={`ticket-item ${selectedTicket?._id === ticket._id ? 'selected' : ''}`}
                        onClick={() => handleTicketClick(ticket)}
                    >
                        {ticket.subject}
                    </div>
                ))}
            </div>

            <div className="chat-area">
                <h3>Ticket Chat</h3>
                {selectedTicket ? (
                    <>
                        <div className="chat-messages">
                            {chatMessages[selectedTicket._id]?.length > 0 ? (
                                chatMessages[selectedTicket._id].map((msg, index) => (
                                    <div key={index} className={`message ${msg.sender === 'User' ? 'from-user' : 'from-support'}`}>
                                        <strong>{msg.sender}:</strong> {msg.message}
                                        <div className="message-meta">
                                            
                                            {msg.fileUrl && (
                                                <a href={msg.fileUrl} target="_blank" rel="noopener noreferrer">View Attachment</a>
                                            )}
                                            <span className="timestamp">{formatDate(msg.createdAt)}</span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p>No chat messages yet.</p>
                            )}
                        </div>
                        
                    </>
                ) : (
                    <p>Select a ticket to view chat</p>
                )}
            </div>

            <div className="ticket-details">
                {selectedTicket ? (
                    <>
                        <h3>Details</h3>
                        <p><strong>IP-DA:</strong> {selectedTicket.subject}</p>
                        <p><strong>Status:</strong> {selectedTicket.status}</p>
                        <p><strong>Subject:</strong> {selectedTicket.description}</p>
                        <p><strong>Created At:</strong> {formatDate(selectedTicket.createdAt)}</p>
                        
                    </>
                ) : (
                    <div className="create-ticket-form">
                        {/* Form for creating tickets */}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Chat;

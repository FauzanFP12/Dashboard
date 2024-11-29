import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import * as XLSX from 'xlsx'; // Import library untuk export ke Excel
import './Chat.css';

const Chat = ({ selectedTicket }) => {
    const [chatMessages, setChatMessages] = useState([]);
    const [modalImage, setModalImage] = useState(null);
    
    const navigate = useNavigate();
        

    useEffect(() => {
        if (selectedTicket) {
            fetchChatMessages(selectedTicket._id);
        }
    }, [selectedTicket]);

    const fetchChatMessages = async (ticketId) => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/helpdesk-tickets/${ticketId}/chat`, {
                headers: {
                    Authorization: `Bearer ${sessionStorage.getItem('token')}`,
                },
            });
            setChatMessages(response.data);
        } catch (error) {
            console.error('Error fetching chat messages:', error);
        }
    };

    const goBack = () => {
        navigate('/helpdesk/view'); // First navigation to '/help-desk/view'
        setTimeout(() => {
            navigate('/help-desk/view'); // Second navigation to '/help-desk/view' after a small delay
        }, 1); // 500 ms delay (adjust as needed)
    };
    

    const exportToExcel = () => {
        if (!chatMessages.length) {
            alert('No chat messages to export.');
            return;
        }

        // Format data untuk Excel
        const formattedData = chatMessages.map((msg, index) => ({
            'No.': index + 1,
            Sender: msg.sender,
            Message: msg.message,
            Timestamp: new Date(msg.createdAt).toLocaleString(),
            
            Attachment: msg.fileUrl || 'None',
        }));

        // Membuat worksheet dan workbook
        const worksheet = XLSX.utils.json_to_sheet(formattedData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Chat Messages');

        // Mengunduh file
        XLSX.writeFile(workbook, `Chat_${selectedTicket.subject || 'Ticket'}.xlsx`);
    };

    const openImageModal = (fileUrl) => {
        setModalImage(fileUrl);
    };

    const closeModal = () => {
        setModalImage(null);
    };

    const renderMessages = () => {
        return chatMessages.map((msg, index) => {
            const isImage = msg.fileUrl?.match(/\.(jpeg|jpg|gif|png)$/i);
            return (
                <div
                    key={index}
                    className={`message ${msg.sender === 'User' ? 'from-user' : 'from-support'}`}
                >
                    <strong>{msg.sender}:</strong> {msg.message}
                    <div className="message-meta">
                        {msg.fileUrl && (
                            <div className="file-attachment">
                                {isImage ? (
                                    <img
                                        src={msg.fileUrl}
                                        alt="attachment"
                                        className="file-image"
                                        onClick={() => openImageModal(msg.fileUrl)}
                                        style={{ cursor: 'pointer' }}
                                    />
                                ) : (
                                    <a href={msg.fileUrl} target="_blank" rel="noopener noreferrer">
                                        <button className="file-download-btn">View Attachment</button>
                                    </a>
                                )}
                            </div>
                        )}
                        <span className="timestamp">{new Date(msg.createdAt).toLocaleString()}</span>
                        
                    </div>
                </div>
            );
        });
    };

    return (
        <div className="chat-container">
            <div className="chat-area">
                <h3>Ticket Chat</h3>
                <div className="chat-messages">
                    {chatMessages.length > 0 ? renderMessages() : <p>No chat messages yet.</p>}
                </div>
            </div>

            <div className="ticket-details">
                <h3>Details</h3>
                <p>
                    <strong>Subject:</strong> {selectedTicket.subject}
                </p>
                <p>
                    <strong>Status:</strong> {selectedTicket.status}
                </p>
                <p>
                    <strong>Description:</strong> {selectedTicket.description}
                </p>
                <p>
                    <strong>Created At:</strong> {new Date(selectedTicket.createdAt).toLocaleString()}
                </p>
                <button onClick={exportToExcel} className="export-button">
                    Export Chat to Excel
                </button>
                <div>
         
                <button onClick={() => goBack()}>Go Back</button>
            {/* Chat implementation here */}
        </div>
            </div>

            {modalImage && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-content">
                        <img src={modalImage} alt="attachment preview" />
                    </div>
                </div>
            )}
        </div>
    );
};

export default Chat;

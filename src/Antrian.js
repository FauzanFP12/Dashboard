import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Antrian.css';

const TicketQueue = () => {
    const [incidents, setIncidents] = useState([]); // State untuk menyimpan daftar insiden
    const [chatMessages, setChatMessages] = useState({}); // State untuk menyimpan pesan chat per insiden
    const [newMessage, setNewMessage] = useState(''); // State untuk pesan baru
    const [selectedIncidentId, setSelectedIncidentId] = useState(null); // ID insiden yang dipilih untuk chat
    const [sender, setSender] = useState('User'); // Nama pengirim pesan
    const [isChatOpen, setIsChatOpen] = useState(false); // Status apakah chat terbuka

    // Fungsi untuk mengambil insiden dengan status 'In Queue'
    const fetchInQueueIncidents = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/insidens`);
            const inQueueIncidents = response.data.filter(incident => incident.status === "In Queue");
            setIncidents(inQueueIncidents); // Update state dengan insiden yang statusnya "In Queue"
        } catch (error) {
            console.error("Error fetching incidents:", error);
        }
    };

    // Fungsi untuk mengambil pesan chat dari insiden yang dipilih
    const fetchChatMessages = async (incidentId) => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/insidens/${incidentId}/chat`);
            setChatMessages((prevChats) => ({
                ...prevChats,
                [incidentId]: response.data,
            }));
            setSelectedIncidentId(incidentId); // Set insiden yang dipilih
            setIsChatOpen(true);  // Buka chat
        } catch (error) {
            console.error("Error fetching chat:", error);
        }
    };

    // Fungsi untuk mengirim pesan chat
    const sendChatMessage = async (incidentId) => {
        if (!newMessage.trim()) {
            alert('Please enter a message.');
            return;
        }

        try {
            const chatResponse = await axios.post(`${process.env.REACT_APP_API_URL}/api/insidens/${incidentId}/chat`, {
                sender, // Pengirim pesan
                message: newMessage // Pesan chat
            });

            if (chatResponse.status === 200) {
                fetchChatMessages(incidentId); // Refresh pesan chat setelah berhasil mengirim
                setNewMessage('');  // Kosongkan input pesan setelah berhasil
            } else {
                throw new Error('Failed to send the chat message.');
            }
        } catch (error) {
            console.error("Error sending message:", error);
        }
    };

    // Fungsi untuk menutup insiden dan memperbarui statusnya
    const handleCloseIncident = async (incident) => {
        try {
            const currentTime = new Date();
            const startTime = incident.tanggalReopen ? new Date(incident.tanggalReopen) : new Date(incident.tanggalSubmit);
            const elapsedMilliseconds = currentTime - startTime;
            const totalElapsedTime = (incident.elapsedTime || 0) + elapsedMilliseconds;
            const formattedElapsedTime = `${formatElapsedTime(totalElapsedTime)} (Closed)`;

            await axios.put(`${process.env.REACT_APP_API_URL}/api/insidens/close/${incident._id}`, {
                elapsedTime: totalElapsedTime,
                status: formattedElapsedTime
            });

            fetchInQueueIncidents();  // Refresh daftar insiden setelah ditutup
            alert('Incident closed successfully.');
        } catch (error) {
            console.error('Error closing incident:', error);
        }
    };

    // Fungsi untuk menutup tampilan chat
    const closeChat = () => {
        setIsChatOpen(false); // Set isChatOpen ke false untuk menutup chat
    };

    // Hook untuk memuat data insiden pada saat komponen pertama kali dirender
    useEffect(() => {
        fetchInQueueIncidents();
    }, []);

    return (
        <div className="ticket-queue-container">
            {incidents.length > 0 ? (
                incidents.map((incident) => (
                    <div key={incident.idInsiden} className="incident-item">
                        <h4>{incident.idInsiden} - {incident.deskripsi}</h4>

                        {/* Tombol untuk membuka chat */}
                        <button onClick={() => fetchChatMessages(incident.idInsiden)}>Open Chat</button>

                        {/* Tombol untuk menutup chat */}
                        {isChatOpen && selectedIncidentId === incident.idInsiden && (
                            <button onClick={closeChat}>Close Chat</button>
                        )}

                        {/* Tampilan chat jika insiden dipilih */}
                        {selectedIncidentId === incident.idInsiden && isChatOpen && (
                            <div className="chat-container">
                                <h5>Chat</h5>
                                {chatMessages[incident.idInsiden]?.map((msg, index) => (
                                    <p key={index} className="chat-message">
                                        <strong>{msg.sender}:</strong> {msg.message}
                                    </p>
                                ))}
                                <div className="chat-input-container">
                                    <input
                                        type="text"
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        placeholder="Type a message..."
                                    />
                                    <button className="send-message-button" onClick={() => sendChatMessage(incident.idInsiden)}>Send</button>
                                </div>
                            </div>
                        )}

                        {/* Tombol untuk menutup insiden */}
                        <button onClick={() => handleCloseIncident(incident)} className="close-incident-button">
                            Close Incident
                        </button>
                    </div>
                ))
            ) : (
                <p className="no-incidents-message">No incidents in the queue.</p>
            )}
        </div>
    );
};

// Fungsi untuk memformat waktu yang berjalan (elapsed time)
const formatElapsedTime = (milliseconds) => {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    return `${days}d ${hours % 24}h ${minutes % 60}m ${seconds % 60}s`;
};

export default TicketQueue;

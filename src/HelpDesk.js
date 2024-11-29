import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Chat from './Chat';
import './HelpDesk.css';

const HelpDesk = () => {
    const [tickets, setTickets] = useState([]);
    const [users, setUsers] = useState([]); // Daftar pengguna untuk dropdown
    const [selectedUser, setSelectedUser] = useState(''); // Pengguna yang dipilih
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [subject, setSubject] = useState('');
    const [description, setDescription] = useState('');
    const [viewChat, setViewChat] = useState(false);

    const navigate = useNavigate();
    const loggedInUser = JSON.parse(sessionStorage.getItem('user'));
    const role = sessionStorage.getItem('role');

    useEffect(() => {
        fetchTickets();
        if (role === 'admin') {
            fetchUsers(); // Hanya admin yang membutuhkan daftar pengguna
        }
    }, []);

    // Fetch tickets from the server
    const fetchTickets = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/helpdesk-tickets`);
            const allTickets = response.data;

            if (role === 'admin') {
                setTickets(allTickets); // Admin melihat semua tiket
            } else {
                // Pengguna biasa melihat hanya tiket mereka sendiri
                const userTickets = allTickets.filter(ticket => ticket.createdBy.fullName === loggedInUser.fullName);
                setTickets(userTickets);
            }
        } catch (error) {
            console.error("Error fetching tickets:", error);
        }
    };

    // Fetch list of users for allocation
    const fetchUsers = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/users`);
            setUsers(response.data); // Menyimpan daftar pengguna
        } catch (error) {
            console.error("Error fetching users:", error);
        }
    };

    // Handle creating a new ticket
    const handleCreateTicket = async () => {
        if (!subject.trim() || !description.trim()) {
            alert("Please enter both a subject and a description.");
            return;
        }

        if (role === 'admin' && !selectedUser) {
            alert("Please select a user to allocate this ticket to.");
            return;
        }

        try {
            const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/helpdesk-tickets`, {
                subject,
                description,
                status: "Open",
                fullName: loggedInUser.fullName,
                allocatedTo: role === 'admin' ? selectedUser : null // Tambahkan alokasi pengguna
            });

            if (response.status === 201) {
                const newTicket = response.data;
                setTickets([...tickets, newTicket]);
                redirectToChat(newTicket); // Buka obrolan untuk tiket baru
                setSubject('');
                setDescription('');
                setSelectedUser(''); // Reset pilihan alokasi

                navigate('/help-desk/general');
            } else {
                throw new Error("Failed to create the ticket.");
            }
        } catch (error) {
            console.error("Error creating ticket:", error);
        }
    };

    // Redirect to Chat view with selected ticket
    const redirectToChat = (ticket) => {
        setSelectedTicket(ticket);
        setViewChat(true);
    };

    return (
        <div className="helpdesk-container">
            {viewChat ? (
                <Chat selectedTicket={selectedTicket} />
            ) : (
                <div className="create-ticket-form">
                    <h3>Create a New Ticket</h3>
                    <input
                        type="text"
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        placeholder="IP-DA"
                    />
                    <textarea
                        className="custom-input1"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Describe your issue..."
                    />

                    {/* Admin-only dropdown for user allocation */}
                    {role === 'admin' && (
                        <div>
                            <label htmlFor="allocate-user">Allocate  : </label>
                            <select
                                id="allocate-user"
                                value={selectedUser}
                                onChange={(e) => setSelectedUser(e.target.value)}
                            >
                                <option value="">Select User</option>
                                {users.map(user => (
                                    <option key={user.id} value={user.fullName}>
                                        {user.fullName}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    <button onClick={handleCreateTicket}>Submit Ticket</button>
                </div>
            )}

            {/* Display list of tickets */}
            {!viewChat && (
                <div className="ticket-list">
                    <h3>Existing Tickets</h3>
                    {tickets.length === 0 ? (
                        <p>No tickets available.</p>
                    ) : (
                        <ul>
                            {tickets.map((ticket) => (
                                <li key={ticket._id} onClick={() => redirectToChat(ticket)}>
                                    {ticket.subject} - {ticket.status}
                                    {role === 'admin' && ticket.allocatedTo && (
                                        <span> (Allocated to: {ticket.allocatedTo})</span>
                                    )}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </div>
    );
};

export default HelpDesk;

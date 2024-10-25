import React from 'react';
import './TicketDetails.css';

const TicketDetails = ({ ticket, onClose }) => {
    if (!ticket) return null; // Don't render if no ticket is selected

    return (
        <div className="ticket-details-modal">
            <div className="modal-content">
                <button className="modal-close" onClick={onClose}>×</button> {/* This is where onClose is used */}
                <h2>Ticket Details</h2>
                <p>ID: {ticket.idInsiden}</p>
                <p>Description: {ticket.deskripsi}</p>
                <p>Status: {ticket.status}</p>
                <p>Start Date: {new Date(ticket.tanggalStart).toLocaleString()}</p>
                <p>SBU: {ticket.sbu}</p>
                <p>Category: {ticket.pilihan}</p>
            </div>
        </div>
    );
};

export default TicketDetails;

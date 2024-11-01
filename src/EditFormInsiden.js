import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './EditFormInsiden.css'; // Import your CSS for styling

const EditFormInsiden = ({ ticket, onEdit }) => {
    const [formData, setFormData] = useState({
        idInsiden: '',
        deskripsi: '',
        status: '',
        tanggalSubmit: '',
        sbu: '',
        pilihan: '',
        priority: 'Medium'  // Tambahkan field priority
    });

    // Helper function to format the date for 'datetime-local'
    const formatDateForInput = (date) => {
        const d = new Date(date);
        d.setHours(d.getHours() + 7); // Convert to GMT+7
        return d.toISOString().slice(0, 16); // Format the date to 'YYYY-MM-DDTHH:MM'
    };

    // Populate the form with existing ticket data when the component mounts
    useEffect(() => {
        if (ticket) {
            setFormData({
                idInsiden: ticket.idInsiden || '',
                deskripsi: ticket.deskripsi || '',
                status: ticket.status || 'Open',
                tanggalSubmit: ticket.tanggalSubmit ? formatDateForInput(ticket.tanggalSubmit) : '',
                sbu: ticket.sbu || '',
                pilihan: ticket.pilihan || 'Backbone',
                priority: ticket.priority || 'Medium'  // Load priority dari tiket
            });
        }
    }, [ticket]);

    // Handle input change
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Convert the 'tanggalSubmit' back to UTC when submitting
            const submittedData = { ...formData };
            const d = new Date(formData.tanggalSubmit);
            d.setHours(d.getHours() - 7); // Convert back from GMT+7 to UTC
            submittedData.tanggalSubmit = d.toISOString();

            const response = await axios.put(`http://10.128.168.209:5000/api/insidens/${ticket._id}`, submittedData);
            onEdit(response.data); // Pass the updated incident back to the parent
        } catch (error) {
            console.error('Error updating incident:', error);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="edit-form">
            <h2>Edit Incident</h2>

            <div className="form-group">
                <label>ID Insiden</label>
                <input
                    type="text"
                    name="idInsiden"
                    value={formData.idInsiden}
                    onChange={handleChange}
                    required
                />
            </div>

            <div className="form-group">
                <label>Description</label>
                <textarea
                    name="deskripsi"
                    value={formData.deskripsi}
                    onChange={handleChange}
                    required
                />
            </div>

            <div className="form-group">
                <label>Status</label>
                <select name="status" value={formData.status} onChange={handleChange} required>
                    <option value="Open">Open</option>
                    <option value="Closed">Closed</option>
                </select>
            </div>

            <div className="form-group">
                <label>Start Date</label>
                <input
                    type="datetime-local"
                    name="tanggalSubmit"
                    value={formData.tanggalSubmit}
                    onChange={handleChange}
                    required
                />
            </div>

            <div className="form-group">
                <label>SBU</label>
                <input
                    type="text"
                    name="sbu"
                    value={formData.sbu}
                    onChange={handleChange}
                    required
                />
            </div>

            <div className="form-group">
                <label>Category</label>
                <select name="pilihan" value={formData.pilihan} onChange={handleChange} required>
                    <option value="Backbone">Backbone</option>
                    <option value="SuperBackbone">Super Backbone</option>
                    <option value="Distribusi">Distribusi</option>
                    <option value="Access">Access</option>
                </select>
            </div>

            {/* Priority */}
            <div className="form-group">
                <label>Priority</label>
                <select name="priority" value={formData.priority} onChange={handleChange} required>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                </select>
            </div>

            <button type="submit" className="button is-success">Save Changes</button>
        </form>
    );
};

export default EditFormInsiden;

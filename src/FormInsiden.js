import React, { useState } from 'react';
import axios from 'axios';
import './FormInsiden.css'; // Import the CSS file

const FormInsiden = ({ addInsiden }) => {
    const [formData, setFormData] = useState({
        idInsiden: '',        // New field for incident ID
        deskripsi: '',
        status: 'Open',
        tanggalStart: '',
        sbu: '',
        pilihan: '',          // Field for selection (backbone, superbackbone, distribusi, access)
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({ ...prevData, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            // Make API request to save the new incident
            const response = await axios.post('http://localhost:5000/api/insidens', formData);
            
            // Call the function passed from the parent component to update the table
            addInsiden(response.data); // Pass the new incident data to App.js to update state

            // Reset the form after submission
            setFormData({
                idInsiden: '',
                deskripsi: '',
                status: 'Open',
                tanggalStart: '',
                sbu: '',
                pilihan: '',
            });
        } catch (error) {
            console.error('Error adding incident:', error);
        }
    };

    return (
        <div className="form-container">
            <h2>Add New Incident</h2>
            <form onSubmit={handleSubmit}>
                {/* ID Insiden */}
                <input
                    type="text"
                    name="idInsiden"
                    value={formData.idInsiden}
                    onChange={handleChange}
                    placeholder="ID Insiden"
                    required
                />
                {/* Deskripsi */}
                <input
                    type="text"
                    name="deskripsi"
                    value={formData.deskripsi}
                    onChange={handleChange}
                    placeholder="Deskripsi"
                    required
                />
                {/* Status */}
                <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    required
                >
                    <option value="Open">Open</option>
                    <option value="InProgress">In Progress</option>
                    <option value="Closed">Closed</option>
                </select>
                {/* Tanggal Start */}
                <input
                    type="datetime-local"
                    name="tanggalStart"
                    value={formData.tanggalStart}
                    onChange={handleChange}
                    required
                />
                {/* SBU */}
                <input
                    type="text"
                    name="sbu"
                    value={formData.sbu}
                    onChange={handleChange}
                    placeholder="Nama SBU"
                    required
                />
                {/* Pilihan (backbone, superbackbone, distribusi, access) */}
                <select
                    name="pilihan"
                    value={formData.pilihan}
                    onChange={handleChange}
                >
                    <option value="">--Pilih Jenis--</option>
                    <option value="Backbone">Backbone</option>
                    <option value="SuperBackbone">Super Backbone</option>
                    <option value="Distribusi">Distribusi</option>
                    <option value="Access">Access</option>
                </select>

                {/* Submit button */}
                <button type="submit">Add Insiden</button>
            </form>
        </div>
    );
};

export default FormInsiden;

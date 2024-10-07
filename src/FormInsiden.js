import React, { useState } from 'react';
import axios from 'axios';
import './FormInsiden.css'; // Import the CSS file

const FormInsiden = ({ addInsiden }) => {
    const [formData, setFormData] = useState({
        idInsiden: '',        // Field for incident ID
        deskripsi: '',
        status: 'Open',
        tanggalSubmit: '',
        sbu: '',
        pilihan: '',          // Field for selection (backbone, superbackbone, distribusi, access)
    });

    const [loading, setLoading] = useState(false); // State for loading
    const [errorMessage, setErrorMessage] = useState(''); // State for error message

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({ ...prevData, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
    
        try {
            // Konversi tanggalSubmit ke UTC sebelum mengirim data
            const formattedData = {
                ...formData,
                // Do not convert to UTC, just send the exact date-time inputted by the user
                tanggalSubmit: formData.tanggalSubmit, // This remains in local time
            };
    
            const response = await axios.post('https://backend-wine-rho.vercel.app/api/insidens', formattedData);
    
            addInsiden(response.data);
    
            // Reset form setelah berhasil submit
            setFormData({
                idInsiden: '',
                deskripsi: '',
                status: 'Open',
                tanggalStart: '',
                tanggalSubmit: '',
                sbu: '',
                pilihan: '',
            });
    
            setErrorMessage('');
        } catch (error) {
            setErrorMessage('Error adding incident. Please try again.');
        } finally {
            setLoading(false);
        }
    };
    

    return (
        <div className="form-container">
            <h2>Add New Incident</h2>
            {/* Display error message if there is one */}
            {errorMessage && <p className="error-message">{errorMessage}</p>}
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
                    name="tanggalSubmit"
                    value={formData.tanggalSubmit}
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
                    required
                >
                    <option value="">--Pilih Jenis--</option>
                    <option value="Backbone">Backbone</option>
                    <option value="SuperBackbone">Super Backbone</option>
                    <option value="Distribusi">Distribusi</option>
                    <option value="Access">Access</option>
                </select>

                {/* Submit button */}
                <button type="submit" disabled={loading}>
                    {loading ? 'Submitting...' : 'Add Insiden'}
                </button>

                {/* Reset button */}
                <button
                    type="button"
                    onClick={() => setFormData({
                        idInsiden: '',
                        deskripsi: '',
                        status: 'Open',
                        tanggalStart: '',
                        tanggalSubmit: '',
                        sbu: '',
                        pilihan: ''
                    })}
                >
                    Reset
                </button>
            </form>
        </div>
    );
};

export default FormInsiden;

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
        priority: 'Medium',      // Tambahkan field priority, dengan default 'Low'
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
            // Konversi tanggalSubmit dari waktu lokal ke UTC -7
            const localDate = new Date(formData.tanggalSubmit);
            const utcDate = new Date(localDate.getTime() + 7 * 60 * 60 * 1000 - 25200 * 1000); // Convert to UTC

            const formattedData = {
                ...formData,
                tanggalSubmit: utcDate.toISOString(), // Kirim dalam format UTC (ISO string)
            };

            const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/insidens`, formattedData);


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
                priority: 'Medium',
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
                <textarea
                    type="text"
                    class="custom-input" 
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
                <select
                    name="sbu"
                    value={formData.sbu}
                    onChange={handleChange}
                    required
                >
                    <option value="">--Pilih SBU--</option>
                    <option value="JAKARTA & BANTEN">JAKARTA & BANTEN</option>
                    <option value="KALIMANTAN">KALIMANTAN</option>
                    <option value="JAWA BAGIAN TENGAH">JAWA BAGIAN TENGAH</option>
                    <option value="SUMATERA BAGIAN TENGAH">SUMATERA BAGIAN TENGAH</option>
                    <option value="SUMATERA BAGIAN SELATAN">SUMATERA BAGIAN SELATAN</option>
                    <option value="JAWA BAGIAN BARAT">JAWA BAGIAN BARAT</option>
                    <option value="SUMATERA BAGIAN UTARA">SUMATERA BAGIAN UTARA</option>
                    <option value="SULAWESI & INDONESIA TIMUR">SULAWESI & INDONESIA TIMUR</option>
                    <option value="JAWA BAGIAN TIMUR">JAWA BAGIAN TIMUR</option>
                    <option value="BALI & NUSA TENGGARA">BALI & NUSA TENGGARA</option>

                </select>
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

                {/* Priority */}
                <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleChange}
                    required
                >
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
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
                        pilihan: '',
                        priority: 'Medium',
                    })}
                > 
                    Reset
                </button>
            </form>
        </div>
    );
};

export default FormInsiden;

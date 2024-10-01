import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './InsidenTable.css';
import FormInsiden from './FormInsiden'; // Import FormInsiden
import TicketDetails from './TicketDetails'; // Import TicketDetails
import EditFormInsiden from './EditFormInsiden'; // Import EditFormInsiden for editing incidents

const InsidenTable = ({ setChartData }) => {
    const [insidens, setInsidens] = useState([]);
    const [filteredInsidens, setFilteredInsidens] = useState([]); // Filtered incidents
    const [searchTerm, setSearchTerm] = useState(''); // State to hold the search term
    const [elapsedFilter, setElapsedFilter] = useState(''); // State to hold elapsed time filter
    const [showModal, setShowModal] = useState(false); // State to control the modal visibility
    const [showEditModal, setShowEditModal] = useState(false); // State for the edit modal
    const [elapsedTimes, setElapsedTimes] = useState([]); // Elapsed times for each incident
    const [selectedTicket, setSelectedTicket] = useState(null); // To display ticket details
    const [currentIncident, setCurrentIncident] = useState(null); // To store the current incident being edited

    // Fetch incidents from the API when the component mounts
    useEffect(() => {
        fetchIncidents();
    }, []);

    // Function to fetch incidents from the API
    const fetchIncidents = async () => {
        try {
            const response = await axios.get('https://backend-wine-rho.vercel.app/api/insidens');
            const incidents = response.data;
            setInsidens(incidents);
            setFilteredInsidens(incidents); // Initialize filtered data with all incidents
            organizeChartData(incidents); // Organize data for the Dashboard
        } catch (error) {
            console.error('Error fetching incidents:', error);
        }
    };

    // Function to calculate elapsed time for incidents and return it in the format 1h 3m 3s
    const calculateElapsedTimes = (incidents) => {
        const currentTime = new Date();
        return incidents.map((insiden) => {
            const elapsedMilliseconds = currentTime - new Date(insiden.tanggalStart);
            const hours = Math.floor(elapsedMilliseconds / (1000 * 60 * 60));
            const minutes = Math.floor((elapsedMilliseconds / (1000 * 60)) % 60);
            const seconds = Math.floor((elapsedMilliseconds / 1000) % 60);
            return `${hours}h ${minutes}m ${seconds}s`;  // Return in 1h 3m 3s format
        });
    };

    // Update elapsed times every second
    useEffect(() => {
        const intervalId = setInterval(() => {
            const updatedElapsedTimes = calculateElapsedTimes(filteredInsidens);
            setElapsedTimes(updatedElapsedTimes);
        }, 1000); // Update every 1 second

        return () => clearInterval(intervalId); // Cleanup interval on component unmount
    }, [filteredInsidens]);

    // Function to organize chart data for the Dashboard
    const organizeChartData = (incidents) => {
        const statusCount = { Open: 0, Closed: 0, InProgress: 0 };
        const categoryCount = { Backbone: 0, SuperBackbone: 0, Distribusi: 0, Access: 0 };

        // Separate data structures for category and status by SBU
        const sbuCategoryData = {};  // To hold category counts per SBU
        const sbuStatusData = {};    // To hold status counts per SBU

        incidents.forEach((insiden) => {
            // Count incidents by status
            if (statusCount[insiden.status] !== undefined) {
                statusCount[insiden.status] += 1;
            }

            // Count incidents by category
            if (categoryCount[insiden.pilihan] !== undefined) {
                categoryCount[insiden.pilihan] += 1;
            }

            const sbu = insiden.sbu || "Unknown SBU";  // Fallback for missing SBU

            // Count incidents per SBU by category (Backbone, Super Backbone, etc.)
            if (!sbuCategoryData[sbu]) {
                sbuCategoryData[sbu] = { Backbone: 0, SuperBackbone: 0, Distribusi: 0, Access: 0 };
            }
            if (sbuCategoryData[sbu][insiden.pilihan] !== undefined) {
                sbuCategoryData[sbu][insiden.pilihan] += 1;
            }

            // Count incidents per SBU by status (Open, Closed, In Progress)
            if (!sbuStatusData[sbu]) {
                sbuStatusData[sbu] = { Open: 0, Closed: 0, InProgress: 0 };
            }
            if (sbuStatusData[sbu][insiden.status] !== undefined) {
                sbuStatusData[sbu][insiden.status] += 1;
            }
        });

        // Prepare the final chart data structure
        const chartData = {
            statusCount,     // Status breakdown
            categoryCount,   // Category breakdown
            sbuCategoryData, // Category counts per SBU (for Stacked Bar Chart)
            sbuStatusData,   // Status counts per SBU (for Grouped Bar Chart)
        };

        // Send the chart data to the Dashboard
        setChartData(chartData);
    };

    // Function to filter incidents based on search term and elapsed time
    const applyFilters = (searchTerm, elapsedFilter) => {
        const currentTime = new Date();

        const filteredData = insidens.filter((insiden) => {
            const matchesSearchTerm = (insiden.idInsiden && insiden.idInsiden.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (insiden.deskripsi && insiden.deskripsi.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (insiden.status && insiden.status.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (insiden.pilihan && insiden.pilihan.toLowerCase().includes(searchTerm.toLowerCase())) ||
                (insiden.sbu && insiden.sbu.toLowerCase().includes(searchTerm.toLowerCase()));

            const elapsedMilliseconds = currentTime - new Date(insiden.tanggalStart);
            const elapsedHours = Math.floor(elapsedMilliseconds / (1000 * 60 * 60));

            const matchesElapsedTime = (() => {
                if (!elapsedFilter) return true; // If no filter selected, show all
                if (elapsedFilter === '<4') return elapsedHours < 4;
                if (elapsedFilter === '<8') return elapsedHours < 8;
                if (elapsedFilter === '<12') return elapsedHours < 12;
                if (elapsedFilter === '<24') return elapsedHours < 24;
                return true;
            })();

            return matchesSearchTerm && matchesElapsedTime;
        });

        setFilteredInsidens(filteredData);
    };

    // Handlers for search and filter
    const handleSearch = (e) => {
        const value = e.target.value;
        setSearchTerm(value);
        applyFilters(value, elapsedFilter);
    };

    const handleElapsedFilter = (e) => {
        const value = e.target.value;
        setElapsedFilter(value);
        applyFilters(searchTerm, value);
    };

    // Function to delete an incident
    const deleteInsiden = async (id) => {
        try {
            await axios.delete(`https://backend-wine-rho.vercel.app/api/insidens/${id}`);
            fetchIncidents(); // Refresh the list after deletion
        } catch (error) {
            console.error('Error deleting incident:', error);
        }
    };

    const downloadCSV = () => {
        // Define CSV headers
        const headers = [
            'No', 
            'ID Insiden', 
            'Description', 
            'Status', 
            'Start Date', 
            'SBU', 
            'Category (Backbone/Super Backbone/Distribusi/Access)', 
            'Elapsed Time (HH:MM:SS)'
        ];
    
        // Prepare CSV rows
        const csvRows = filteredInsidens.map((insiden, index) => {
            const elapsedTime = elapsedTimes[index]; // Get the corresponding elapsed time
            const startDate = new Date(insiden.tanggalStart).toLocaleString(); // Format start date
    
            // Format each field, wrapping in quotes if it contains a comma
            return [
                index + 1, // No
                `"${insiden.idInsiden || ''}"`, // ID Insiden
                `"${insiden.deskripsi || ''}"`, // Description
                `"${insiden.status || ''}"`, // Status
                `"${startDate}"`, // Start Date
                `"${insiden.sbu || ''}"`, // SBU
                `"${insiden.pilihan || ''}"`, // Category
                `"${elapsedTime || ''}"`, // Elapsed Time
            ].join(','); // Join fields with commas to create a CSV row
        });
    
        // Combine header and rows
        const csvContent = [
            headers.join(','), // Add the header row
            ...csvRows // Add the data rows
        ].join('\n'); // Separate rows with newlines
    
        // Create a Blob for the CSV content and trigger download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', 'incidents.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Function to handle row click and show ticket details
    const handleRowClick = (insiden) => {
        if (!showEditModal) { // Prevent opening details when in edit mode
            setSelectedTicket(insiden);
        }
    };

    // Function to handle editing an incident
    const handleEditIncident = async (updatedIncident) => {
        try {
            await axios.put(`https://backend-wine-rho.vercel.app/api/insidens/${updatedIncident._id}`, updatedIncident);
            fetchIncidents(); // Refresh the list after saving changes
            setShowEditModal(false); // Close the edit modal
            setCurrentIncident(null); // Clear the current incident
        } catch (error) {
            console.error('Error updating incident:', error);
        }
    };

    // Function to open edit modal with selected incident data
    const openEditModal = (insiden) => {
        setCurrentIncident(insiden); // Set the current incident to be edited
        setShowEditModal(true); // Open the edit modal
    };

    // Function to handle adding a new incident from FormInsiden
    const handleAddIncident = (newIncident) => {
        setInsidens([...insidens, newIncident]);
        setShowModal(false); // Close the modal after adding the incident
        fetchIncidents(); // Refresh the list after adding
    };

    return (
        <div className="table-container">
            <div className="filter-bar">
                {/* Search Input */}
                <input
                    type="text"
                    value={searchTerm}
                    onChange={handleSearch}
                    placeholder="Search by ID, Description, Status, or SBU..."
                    className="search-input"
                />

                {/* Elapsed Time Filter */}
                <select value={elapsedFilter} onChange={handleElapsedFilter} className="elapsed-filter">
                    <option value="">All Elapsed Times</option>
                    <option value="<4">&lt; 4 hours</option>
                    <option value="<8">&lt; 8 hours</option>
                    <option value="<12">&lt; 12 hours</option>
                    <option value="<24">&lt; 24 hours</option>
                </select>

                <button className="button is-success mb-3" onClick={() => setShowModal(true)}>
                    Add New Incident
                </button>

                <div>
                    <button onClick={downloadCSV}>Download CSV</button>
                </div>
            </div>

            {/* Add Incident Modal */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
                        <FormInsiden addInsiden={handleAddIncident} />
                    </div>
                </div>
            )}

            {/* Edit Incident Modal */}
            {showEditModal && currentIncident && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <button className="modal-close" onClick={() => setShowEditModal(false)}>×</button>
                        <EditFormInsiden
                            ticket={currentIncident}
                            onEdit={handleEditIncident}
                        />
                    </div>
                </div>
            )}

            {/* Incident Table */}
            <table className="table is-striped is-fullwidth">
                <thead>
                    <tr>
                        <th>No</th>
                        <th>ID Insiden</th>
                        <th>Description</th>
                        <th>Status</th>
                        <th>Start Date</th>
                        <th>SBU</th>
                        <th>Category (Backbone/Super Backbone/Distribusi/Access)</th>
                        <th>Elapsed Time</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredInsidens.length === 0 ? (
                        <tr>
                            <td colSpan="9">No incidents found.</td>
                        </tr>
                    ) : (
                        filteredInsidens.map((insiden, index) => (
                            <tr key={insiden._id} onClick={() => handleRowClick(insiden)}>
                                <td>{index + 1}</td>
                                <td>{insiden.idInsiden}</td>
                                <td>{insiden.deskripsi}</td>
                                <td>{insiden.status}</td>
                                <td>{new Date(insiden.tanggalStart).toLocaleString()}</td>
                                <td>{insiden.sbu}</td>
                                <td>{insiden.pilihan}</td>
                                <td>{elapsedTimes[index]}</td>
                                <td>
                                    <button
                                        className="button is-info is-small"
                                        onClick={(e) => {
                                            e.stopPropagation(); // Prevent row click event
                                            openEditModal(insiden); // Open edit modal
                                        }}
                                    >
                                        Edit
                                    </button>
                                    <button
                                     className="button is-danger is-small"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          deleteInsiden(insiden._id)
                                        }}
                                       
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>

            {/* Ticket Details Modal */}
            {selectedTicket && (
                <TicketDetails
                    ticket={selectedTicket}
                    onClose={() => setSelectedTicket(null)}
                />
            )}
        </div>
    );
};

export default InsidenTable;

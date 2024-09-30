import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './InsidenTable.css';
import FormInsiden from './FormInsiden'; // Import FormInsiden

const InsidenTable = ({ setChartData }) => {
  const [insidens, setInsidens] = useState([]);
  const [filteredInsidens, setFilteredInsidens] = useState([]); // Filtered incidents
  const [elapsedTimes, setElapsedTimes] = useState([]);
  const [searchTerm, setSearchTerm] = useState(''); // State to hold the search term
  const [elapsedFilter, setElapsedFilter] = useState(''); // State to hold elapsed time filter
  const [showModal, setShowModal] = useState(false); // State to control the modal visibility

  // Fetch incidents from the API when the component mounts
  useEffect(() => {
    fetchIncidents();
  }, []);

  // Function to fetch incidents from the API
  const fetchIncidents = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/insidens');
      const incidents = response.data;
      setInsidens(incidents);
      setFilteredInsidens(incidents); // Initialize filtered data with all incidents
      calculateElapsedTimes(incidents); // Calculate elapsed time for all incidents
      organizeChartData(incidents); // Organize data for the Dashboard
    } catch (error) {
      console.error('Error fetching incidents:', error);
    }
  };

  // Function to calculate elapsed times and update the chart data
  const calculateElapsedTimes = (incidents) => {
    const currentTime = new Date();
    const times = incidents.map((insiden) => {
      const elapsedMilliseconds = currentTime - new Date(insiden.tanggalStart);
      const hours = Math.floor(elapsedMilliseconds / (1000 * 60 * 60));
      const minutes = Math.floor((elapsedMilliseconds / (1000 * 60)) % 60);
      const seconds = Math.floor((elapsedMilliseconds / 1000) % 60);
      return { hours, minutes, seconds };
    });

    setElapsedTimes(times);
  };

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

  // Update elapsed times every second
  useEffect(() => {
    const interval = setInterval(() => {
      calculateElapsedTimes(insidens);
    }, 1000);  // Update every second

    return () => clearInterval(interval);  // Cleanup interval on component unmount
  }, [insidens]);

  // Function to filter incidents based on search term and elapsed time
  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    applyFilters(value, elapsedFilter);
  };

  // Function to filter based on elapsed time
  const handleElapsedFilter = (e) => {
    const value = e.target.value;
    setElapsedFilter(value);
    applyFilters(searchTerm, value);
  };

  const applyFilters = (searchTerm, elapsedFilter) => {
    const filteredData = insidens.filter((insiden, index) => {
      const matchesSearchTerm = (insiden.idInsiden && insiden.idInsiden.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (insiden.deskripsi && insiden.deskripsi.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (insiden.status && insiden.status.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (insiden.sbu && insiden.sbu.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesElapsedTime = (() => {
        const hours = elapsedTimes[index]?.hours || 0;
        if (!elapsedFilter) return true; // If no filter selected, show all
        if (elapsedFilter === '<4') return hours < 4;
        if (elapsedFilter === '<8') return hours < 8;
        if (elapsedFilter === '<12') return hours < 12;
        if (elapsedFilter === '<24') return hours < 24;
        return true;
      })();

      return matchesSearchTerm && matchesElapsedTime;
    });

    setFilteredInsidens(filteredData);
  };

  // Function to delete an incident
  const deleteInsiden = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/insidens/${id}`);
      fetchIncidents(); // Refresh the list after deletion
    } catch (error) {
      console.error('Error deleting incident:', error);
    }
  };

  // Function to handle adding a new incident from FormInsiden
  const handleAddIncident = (newIncident) => {
    setInsidens([...insidens, newIncident]);
    setShowModal(false); // Close the modal after adding the incident
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
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            <FormInsiden addInsiden={handleAddIncident} />
          </div>
        </div>
      )}

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
            <th>Elapsed Time (HH:MM:SS)</th>
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
              <tr key={insiden._id}>
                <td>{index + 1}</td>
                <td>{insiden.idInsiden}</td> {/* Display ID Insiden */}
                <td>{insiden.deskripsi}</td>
                <td>{insiden.status}</td>
                <td>{new Date(insiden.tanggalStart).toLocaleString()}</td>
                <td>{insiden.sbu}</td> {/* Display SBU */}
                <td>{insiden.pilihan}</td> {/* Display Category */}
                <td>
                  {/* Display Elapsed Time in HH:MM:SS */}
                  {elapsedTimes[index] && (
                    `${String(elapsedTimes[index].hours).padStart(2, '0')}:` +
                    `${String(elapsedTimes[index].minutes).padStart(2, '0')}:` +
                    `${String(elapsedTimes[index].seconds).padStart(2, '0')}`
                  )}
                </td>
                <td>
                  <button className="button is-info is-small" onClick={() => alert('Edit feature to be implemented.')}>
                    Edit
                  </button>
                  <button
                    onClick={() => deleteInsiden(insiden._id)}
                    className="button is-danger is-small"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default InsidenTable;

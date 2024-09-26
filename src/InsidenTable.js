// InsidenTable.js
import React, { useState, useEffect } from 'react';
import './InsidenTable.css';

const InsidenTable = ({ insidenList = [] }) => {
  const [filteredList, setFilteredList] = useState(insidenList);
  const [filterOption, setFilterOption] = useState('');
  const [elapsedTimes, setElapsedTimes] = useState([]);
  const [initialLoadTime] = useState(new Date()); // Set the initial load time only once

  // Function to calculate elapsed time since the table was first loaded, in days, hours, and minutes
  const calculateElapsedTime = (loadTime) => {
    const currentTime = new Date();
    const elapsedMilliseconds = currentTime - loadTime;

    const days = Math.floor(elapsedMilliseconds / (1000 * 60 * 60 * 24));
    const hours = Math.floor((elapsedMilliseconds % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((elapsedMilliseconds % (1000 * 60 * 60)) / (1000 * 60));

    return { days, hours, minutes };
  };

  // Set interval to update elapsed times every minute
  useEffect(() => {
    const interval = setInterval(() => {
      const updatedElapsedTimes = insidenList.map(() => calculateElapsedTime(initialLoadTime));
      setElapsedTimes(updatedElapsedTimes);
    }, 60000); // Update every 60 seconds

    // Cleanup interval on component unmount
    return () => clearInterval(interval);
  }, [insidenList, initialLoadTime]); // Include initialLoadTime in the dependency array

  // Update filtered list when filterOption changes or elapsed times update
  useEffect(() => {
    if (!filterOption) {
      setFilteredList(insidenList);
    } else {
      const maxHours = parseInt(filterOption, 10);
      setFilteredList(
        insidenList.filter((_, index) => {
          const { days, hours } = elapsedTimes[index] || { days: 0, hours: 0 };
          return days * 24 + hours < maxHours;
        })
      );
    }
  }, [filterOption, insidenList, elapsedTimes]);

  return (
    <div className="insiden-table-container">
      <h2 className="table-title">Incident Table</h2>

      {/* Filter Options */}
      <div className="filter-section">
        <label htmlFor="timeFilter">Filter by Elapsed Time:</label>
        <select
          id="timeFilter"
          value={filterOption}
          onChange={(e) => setFilterOption(e.target.value)}
        >
          <option value="">All</option>
          <option value="4">&lt; 4 Hours</option>
          <option value="8">&lt; 8 Hours</option>
          <option value="12">&lt; 12 Hours</option>
          <option value="24">&lt; 24 Hours</option>
        </select>
      </div>

      <table className="insiden-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Deskripsi</th>
            <th>Status</th>
            <th>Tanggal Start</th>
            <th>Durasi (jam)</th>
            <th>SBU</th>
            <th>Backbone</th>
            <th>Super Backbone</th>
            <th>Distribusi</th>
            <th>Access</th>
            <th>Pilihan</th>
            <th>Waktu yang Berlalu</th> {/* Added column for elapsed time */}
          </tr>
        </thead>
        <tbody>
          {filteredList.length === 0 ? (
            <tr>
              <td colSpan="12" className="no-data">
                No incidents found.
              </td>
            </tr>
          ) : (
            filteredList.map((insiden, index) => {
              const { days, hours, minutes } = elapsedTimes[index] || { days: 0, hours: 0, minutes: 0 };
              return (
                <tr key={index}>
                  <td>{insiden.id}</td>
                  <td>{insiden.deskripsi}</td>
                  <td>{insiden.status}</td>
                  <td>{insiden.tanggalStart}</td>
                  <td>{insiden.durasi}</td>
                  <td>{insiden.sbu}</td>
                  <td>{insiden.backbone}</td>
                  <td>{insiden.superbackbone}</td>
                  <td>{insiden.distribusi}</td>
                  <td>{insiden.access}</td>
                  <td>{insiden.pilihan}</td>
                  <td>
                    {days > 0 && `${days} Hari, `}
                    {hours > 0 && `${hours} Jam, `}
                    {minutes} Menit
                  </td> {/* Display elapsed time */}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
};

export default InsidenTable;

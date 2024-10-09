import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { AgGridReact } from 'ag-grid-react';
import axios from 'axios';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import './InsidenTable.css';
import FormInsiden from './FormInsiden';
import TicketDetails from './TicketDetails';
import EditFormInsiden from './EditFormInsiden';
import Chart from 'chart.js/auto';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { ModuleRegistry } from '@ag-grid-community/core';
import * as XLSX from 'xlsx';

// Register ag-Grid community module
ModuleRegistry.registerModules([ClientSideRowModelModule]);

const InsidenTable = ({ setChartData }) => {
    const [gridApi, setGridApi] = useState(null);  
    const [gridColumnApi, setGridColumnApi] = useState(null);  
    const [loading, setLoading] = useState(false); // State for loading indicator
    const [insidens, setInsidens] = useState([]);
    const [filteredInsidens, setFilteredInsidens] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [elapsedFilter, setElapsedFilter] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [elapsedTimes, setElapsedTimes] = useState([]);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [currentIncident, setCurrentIncident] = useState(null);
    const [selectedRows, setSelectedRows] = useState([]);
    const [loadingDelete, setLoadingDelete] = useState(false); // State for delete loading
    const [loadingUpload, setLoadingUpload] = useState(false); // State for upload loading
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [modalData, setModalData] = useState(null);
    const [elapsedTimeInterval, setElapsedTimeInterval] = useState(null);

    const containerStyle = useMemo(() => ({ width: '100%', height: '100%' }), []);
    const gridStyle = useMemo(() => ({ height: 600, width: '100%' }), []);

    useEffect(() => {
        fetchIncidents();
    }, []);

    const fetchIncidents = async () => {
        try {
            const response = await axios.get('https://backend-wine-rho.vercel.app/api/insidens');
            const incidents = response.data;
            setInsidens(incidents);
            setFilteredInsidens(incidents);
            organizeChartData(incidents);
        } catch (error) {
            console.error('Error fetching incidents:', error);
        }
    };

    const msToTime = (milliseconds) => {
        const days = Math.floor(milliseconds / (1000 * 60 * 60 * 24));
        const hours = Math.floor((milliseconds / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((milliseconds / (1000 * 60)) % 60);
        const seconds = Math.floor((milliseconds / 1000) % 60);
    
        let result = '';
        if (days > 0) result += `${days}d `;
        if (hours > 0) result += `${hours}h `;
        if (minutes > 0) result += `${minutes}m `;
        if (seconds > 0 || result === '') result += `${seconds}s `;
    
        return result.trim();
    };

    const calculateElapsedTime = (insiden) => {
        const currentTime = new Date();
        const startTime = new Date(insiden.tanggalSubmit);
    
        // Calculate elapsed time
        if (insiden.status === "Closed") {
            // Use the stored elapsed time in milliseconds and convert it to a formatted string
            return formatElapsedTime(insiden.elapsedTime);
        } else {
            // Calculate elapsed time for open incidents
            const elapsedMilliseconds = currentTime - startTime;
            return formatElapsedTime(elapsedMilliseconds); // Format to string
        }
    };
    

    const handleCloseIncident = async (incident) => {
        try {
            // Calculate total elapsed time when closing the incident
            const currentTime = new Date();
            const totalElapsedTime = currentTime - new Date(incident.tanggalSubmit);
            
            await axios.put(`https://backend-wine-rho.vercel.app/api/insidens/close/${incident._id}`, {
                elapsedTime: totalElapsedTime // Save the calculated elapsed time
            });
            fetchIncidents();  // Refresh the incident list after closing
        } catch (error) {
            console.error('Error closing incident:', error);
        }
    };
    
    const handleReopenIncident = async (incident) => {
        try {
            await axios.put(`https://backend-wine-rho.vercel.app/api/insidens/reopen/${incident._id}`);
            fetchIncidents();  // Refresh the incident list after reopening
        } catch (error) {
            console.error('Error reopening incident:', error);
        }
    };
    
    const renderStatusActionButton = (insiden) => {
        if (insiden.status === 'Closed') {
            return (
                <button onClick={(event) => { event.stopPropagation(); handleReopenIncident(insiden); }} className="button is-success">
                    Reopen
                </button>
            );
        }
        return (
            <button onClick={(event) => { event.stopPropagation(); handleCloseIncident(insiden); }} className="button is-warning">
                Close
            </button>
        );
    };

    useEffect(() => {
        const intervalId = setInterval(() => {
            const updatedElapsedTimes = filteredInsidens.map(insiden => calculateElapsedTime(insiden));
            setElapsedTimes(updatedElapsedTimes);

            if (gridApi) {
                const rowNodes = [];
                filteredInsidens.forEach((insiden, index) => {
                    const elapsedTime = calculateElapsedTime(insiden);
                    if (insiden.status !== "Closed") { // Only update if the status is not closed
                        insiden.elapsedTime = elapsedTime; // Update elapsed time for open incidents
                        rowNodes.push({ rowIndex: index });
                    }
                });
                gridApi.refreshCells({ columns: ['elapsedTime'], rowNodes });
            }
        }, 10000);

        setElapsedTimeInterval(intervalId); // Save interval ID to state

        return () => clearInterval(intervalId);
    }, [filteredInsidens, gridApi]);

    const organizeChartData = (incidents) => {
        const statusCount = { Open: 0, Closed: 0, InProgress: 0 };
        const categoryCount = { Backbone: 0, SuperBackbone: 0, Distribusi: 0, Access: 0 };

        const sbuCategoryData = {};
        const sbuStatusData = {};

        incidents.forEach((insiden) => {
            if (statusCount[insiden.status] !== undefined) {
                statusCount[insiden.status] += 1;
            }
            if (categoryCount[insiden.pilihan] !== undefined) {
                categoryCount[insiden.pilihan] += 1;
            }
            const sbu = insiden.sbu || "Unknown SBU";

            if (!sbuCategoryData[sbu]) {
                sbuCategoryData[sbu] = { Backbone: 0, SuperBackbone: 0, Distribusi: 0, Access: 0 };
            }
            if (sbuCategoryData[sbu][insiden.pilihan] !== undefined) {
                sbuCategoryData[sbu][insiden.pilihan] += 1;
            }

            if (!sbuStatusData[sbu]) {
                sbuStatusData[sbu] = { Open: 0, Closed: 0, InProgress: 0 };
            }
            if (sbuStatusData[sbu][insiden.status] !== undefined) {
                sbuStatusData[sbu][insiden.status] += 1;
            }
        });

        const chartData = {
            statusCount,
            categoryCount,
            sbuCategoryData,
            sbuStatusData,
        };

        setChartData(chartData);
    };

    const handleElapsedFilterChange = (e) => {
        const value = e.target.value;
        setElapsedFilter(value);
        applyFilters(value);
    };
    
    const applyFilters = useCallback((term, elapsed) => {
        const currentTime = new Date();
        
        const filteredData = insidens.filter((insiden) => {
            const matchesSearchTerm = (insiden.idInsiden && insiden.idInsiden.toLowerCase().includes(term.toLowerCase())) ||
                (insiden.deskripsi && insiden.deskripsi.toLowerCase().includes(term.toLowerCase())) ||
                (insiden.status && insiden.status.toLowerCase().includes(term.toLowerCase())) ||
                (insiden.pilihan && insiden.pilihan.toLowerCase().includes(term.toLowerCase())) ||
                (insiden.sbu && insiden.sbu.toLowerCase().includes(term.toLowerCase()));

            const elapsedMilliseconds = currentTime - new Date(insiden.tanggalSubmit);
            const elapsedHours = Math.floor(elapsedMilliseconds / (1000 * 60 * 60));

            const matchesElapsedTime = (() => {
                if (!elapsed) return true;
                if (elapsed === '<4') return elapsedHours < 4;
                if (elapsed === '<8') return elapsedHours < 8;
                if (elapsed === '<12') return elapsedHours < 12;
                if (elapsed === '<24') return elapsedHours < 24;
                return true;
            })();

            return matchesSearchTerm && matchesElapsedTime;
        });

        setFilteredInsidens(filteredData);
    }, [insidens]);

    const handleSearch = (e) => {
        const value = e.target.value;
        setSearchTerm(value);
        applyFilters(value, elapsedFilter);
    };

    const handleDeleteIncident = async (incidentId) => {
        try {
            await axios.delete(`https://backend-wine-rho.vercel.app/api/insidens/${incidentId}`);
            fetchIncidents();  // Refresh the incidents list after deletion
        } catch (error) {
            console.error('Error deleting incident:', error);
        }
    };
    

    const downloadCSV = () => {
        const headers = [
            'No', 'ID Insiden', 'Description', 'Status', 'Start Date','Start Incident', 'SBU', 'Category', 'Elapsed Time'
        ];

        const csvRows = filteredInsidens.map((insiden, index) => {
            const elapsedTime = insiden.status === "Closed" ? insiden.elapsedTime : elapsedTimes[index]; // Get elapsed time
            const startDate = new Date(insiden.tanggalSubmit);

            return [
                index + 1,
                `"${insiden.idInsiden || ''}"`,
                `"${insiden.deskripsi || ''}"`,
                `"${insiden.status || ''}"`,
                `"${insiden.tanggalStart || ''}"`,
                `"${startDate}"`,
                `"${insiden.sbu || ''}"`,
                `"${insiden.pilihan || ''}"`,
                `"${elapsedTime || ''}"`,
            ].join(',');
        });

        const csvContent = [headers.join(','), ...csvRows].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', 'incidents.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    const formatElapsedTime = (elapsedTime) => {
        // Check if the elapsed time is already in a string format (human-readable)
        if (typeof elapsedTime === 'string') {
            return elapsedTime; // If it's already formatted, return as is
        }
    
        // Otherwise, format it from milliseconds (number) to a human-readable format
        const totalSeconds = Math.floor(elapsedTime / 1000);
        const days = Math.floor(totalSeconds / (3600 * 24));
        const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
    
        let result = '';
        if (days > 0) result += `${days}d `;
        if (hours > 0) result += `${hours}h `;
        if (minutes > 0) result += `${minutes}m `;
        if (seconds > 0 || result === '') result += `${seconds}s`;
    
        return result.trim();
    };
    
    

    const downloadExcel = () => {
        // Format data for Excel
        const formattedData = filteredInsidens.map(({ id, _v, ...incident }) => ({
            idInsiden: incident.idInsiden,
            deskripsi: incident.deskripsi,
            status: incident.status,
            sbu: incident.sbu,
            pilihan: incident.pilihan,
            tanggalStart: formatDateUTC(incident.tanggalSubmit), // Format tanggal start
            tanggalSubmit: formatDateUTCS(incident.tanggalStart), // Format tanggal submit
            elapsedTimes:  formatElapsedTime (incident.elapsedTime)
        }));

        const headers = [
            { A: 'ID Ticket'},
            { B: 'Deskripsi' },
            { C: 'Status' },
            { D: 'SBU' },
            { E: 'Pilihan' },
            { F: 'Tanggal Start' },
            { G: 'Tanggal Submit' },
            { H: 'Waktu Yang Dibutuhkan',}
        ];

        const worksheet = XLSX.utils.aoa_to_sheet([ // Using aoa_to_sheet to insert headers
            headers.map(header => Object.values(header)[0]), // Get header values
            ...formattedData.map(row => [
                row.idInsiden,
                row.deskripsi,
                row.status,
                row.sbu,
                row.pilihan,
                row.tanggalStart,
                row.tanggalSubmit,
                row.elapsedTimes
            ])
        ]);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Incidents');
        XLSX.writeFile(workbook, 'incidents.xlsx');
    };
    
    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) {
            alert('Please select a file.');
            return;
        }

        

        setLoadingUpload(true); // Start loading when file is uploaded

        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const data = new Uint8Array(event.target.result);
                const workbook = XLSX.read(data, { type: 'array' });

                if (workbook.SheetNames.length === 0) {
                    throw new Error('The Excel file does not contain any sheets.');
                }

                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];

                if (!worksheet) {
                    throw new Error('Cannot find a valid worksheet in the Excel file.');
                }

                const jsonData = XLSX.utils.sheet_to_json(worksheet);

                if (jsonData.length === 0) {
                    throw new Error('The Excel sheet is empty.');
                }

                for (const row of jsonData) {
                    const currentDate = new Date(); // Get current date and time
                    const gmt7Date = addGMT7(currentDate); // Adjust to GMT+7
                    
                    // Create a new incident object from Excel data
                    const startDate = row['Tanggal Start'] ? addGMT7(new Date(formatDate(row['Tanggal Start']))) : gmt7Date;
                    const submitDate = row['Tanggal Submit'] ? addGMT7(new Date(formatDate(row['Tanggal Submit']))) : gmt7Date;

                    // Calculate elapsed time
                    let elapsedTime = elapsedTimes;

                    if (!row['Waktu Yang Dibutuhkan'] || row['Waktu Yang Dibutuhkan'] < 0) {
                        elapsedTime = gmt7Date - startDate; // Time running until now
                    } else {
                        elapsedTime = row['Waktu Yang Dibutuhkan']; // Use provided elapsed time
                    }
                    
                    const newIncident = {
                        idInsiden: row['ID Ticket'],
                        deskripsi: row['Deskripsi'],
                        status: row['Status'],
                        sbu: row['SBU'],
                        pilihan: row['Pilihan'],
                        tanggalStart: row['Tanggal Submit'] ? addGMT7(new Date(formatDate(row['Tanggal Submit']))) : gmt7Date,
                        tanggalSubmit: row['Tanggal Start'] ? addGMT7(new Date(formatDate(row['Tanggal Start']))) : gmt7Date,
                        elapsedTimes: elapsedTime < 0 ? elapsedTime : elapsedTime, // Ensure no negative elapsed time
                    };

                    if (!newIncident.idInsiden || !newIncident.deskripsi) {
                        throw new Error('Invalid data format in the Excel sheet. Please check the required fields.');
                    }

                    await axios.post('https://backend-wine-rho.vercel.app/api/insidens', newIncident);
                }

                fetchIncidents();
                alert('Data successfully uploaded and saved to the database!');
                window.location.reload(); // Refresh the page after successful upload
            } catch (error) {
                console.error('Error processing the file:', error);
                alert(`Failed to upload the file: ${error.message}`);
            } finally {
                setLoadingUpload(false); // Stop loading after processing
            }
        };

        reader.readAsArrayBuffer(file);
    };

   

    
    // Utility function to format date strings
    const formatDate = (dateString) => {
        if (!dateString) return new Date(); // Return current date if dateString is empty
    
        const parts = dateString.split(', ');
        const datePart = parts[0].split('/'); // Split date into day, month, year
        const timePart = parts[1].replace(/\./g, ':'); // Replace periods with colons for time
    
        // Rearranging date parts to YYYY-MM-DD format (ISO format)
        const formattedDate = `${datePart[2]}-${datePart[1].padStart(2, '0')}-${datePart[0].padStart(2, '0')}`;
        
        // Return the full ISO formatted date without milliseconds
        return `${formattedDate}T${timePart}`;
    };
    
    // Add 7 hours to convert to GMT+7
    const addGMT7 = (date) => {
        const gmt7Offset = 0 * 0 * 0 * 0; // 7 hours in milliseconds
        return new Date(date.getTime() + gmt7Offset);
    };

    const addGMT8 = (date) => {
        const gmt7Offset = 7 * 60 * 60 * 1000; // 7 hours in milliseconds
        return new Date(date.getTime() + gmt7Offset);
    };
    
    const handleAddIncident = (newIncident) => {
        setInsidens([...insidens, newIncident]);
        setShowModal(false);
        fetchIncidents();
    };

    const handleEditIncident = async (updatedIncident) => {
        try {
            await axios.put(`https://backend-wine-rho.vercel.app/api/insidens/${updatedIncident._id}`, updatedIncident);
            fetchIncidents();
            setShowEditModal(false);
            setCurrentIncident(null);
        } catch (error) {
            console.error('Error updating incident:', error);
        }
    };

    const openEditModal = (incident) => {
        setCurrentIncident(incident);
        setShowEditModal(true);
    };

    const onSelectionChanged = (params) => {
        setSelectedRows(params.api.getSelectedRows());
    };

    const onRowClicked = (params) => {
        // Ensure the modal does not show when clicking buttons within the row
        if (params.event.target.tagName === 'BUTTON') {
            return; // Ignore button clicks
        }
        setModalData(params.data); // This will show the details in the modal
        setShowDetailsModal(true); // Only show modal when row itself is clicked
    };

    const formatDateUTC = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleString('id-ID', {
            timeZone: 'UTC',
            month: 'numeric', 
            day: 'numeric', 
            year: 'numeric', 
            hour: 'numeric', 
            minute: 'numeric',
            second: 'numeric',
            hour24: true
        });
    };

    const formatDateUTCS = (dateString) => {
        if (!dateString) return '';
        
        // Convert the date to the user's local time by adding 7 hours
        const date = new Date(dateString);
        const gmt7Date = new Date(date.getTime() + (0 * 60 * 60 * 1000)); // Adjust to GMT+7
    
        // Format the date to 'id-ID' locale in GMT+7 without converting back to UTC
        return gmt7Date.toLocaleString('id-ID', {
            month: 'numeric', 
            day: 'numeric', 
            year: 'numeric', 
            hour: 'numeric', 
            minute: 'numeric',
            second: 'numeric',
            hour12: false, // To ensure 24-hour format
        });
    };
    const downloadSelectedExcel = () => {
        if (selectedRows.length === 0) {
            return alert('Please select incidents to download.');
        }
            
            const formattedData = selectedRows.map(({ id, _v, ...incident }) => ({
                idInsiden: incident.idInsiden,
                deskripsi: incident.deskripsi,
                status: incident.status,
                sbu: incident.sbu,
                pilihan: incident.pilihan,
                tanggalStart: formatDateUTC(incident.tanggalSubmit), // Format tanggal start
                tanggalSubmit: formatDateUTCS(incident.tanggalStart), // Format tanggal submit
                elapsedTimes:  formatElapsedTime (incident.elapsedTime)
            }));

            const headers = [
                { A: 'ID Ticket'},
                { B: 'Deskripsi' },
                { C: 'Status' },
                { D: 'SBU' },
                { E: 'Pilihan' },
                { F: 'Tanggal Start' },
                { G: 'Tanggal Submit' },
                { H: 'Waktu Yang Dibutuhkan',}
            ];
    
            const worksheet = XLSX.utils.aoa_to_sheet([ // Using aoa_to_sheet to insert headers
                headers.map(header => Object.values(header)[0]), // Get header values
                ...formattedData.map(row => [
                    row.idInsiden,
                    row.deskripsi,
                    row.status,
                    row.sbu,
                    row.pilihan,
                    row.tanggalStart,
                    row.tanggalSubmit,
                    row.elapsedTimes
                ])
            ]);

        
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Selected Incidents');
        XLSX.writeFile(workbook, 'selected_incidents.xlsx');
    };


    

    const columnDefs = [
        { field: 'idInsiden', headerName: 'ID Insiden', pinned: 'left', checkboxSelection: true, sortable: true, filter: 'agTextColumnFilter' },
        {
            field: 'deskripsi',
            headerName: 'Description',
            editable: true,
            sortable: true,
            filter: 'agTextColumnFilter',
            cellRendererFramework: (params) => {
                const text = params.value || '';
                const maxLength = 100;
                const truncatedText = text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;

                return (
                    <div title={text}>
                        {truncatedText.split('\n').map((line, index) => (
                            <p key={index} style={{ margin: 0 }}>{line}</p>
                        ))}
                    </div>
                );
            },
        },
        { 
            field: 'tanggalSubmit', 
            headerName: 'Start Incident', 
            valueFormatter: (params) => formatDateUTCS(params.value), 
            filter: 'agDateColumnFilter', 
            sortable: true 
        },
        { 
            field: 'tanggalStart',  
            headerName: 'Start Date (Submit)',  
            valueFormatter: (params) => formatDateUTCS(params.value), 
            filter: 'agDateColumnFilter', 
            sortable: true 
        },
        { field: 'status', headerName: 'Status', sortable: true, filter: 'agTextColumnFilter' },
        { field: 'sbu', headerName: 'SBU', sortable: true, filter: 'agTextColumnFilter' },
        { field: 'pilihan', headerName: 'Category', sortable: true, filter: 'agTextColumnFilter' },
        { 
            field: 'elapsedTime', 
            headerName: 'Elapsed Time', 
            valueGetter: (incident) => calculateElapsedTime(incident.data) 
        },
        {
            headerName: 'Actions',
            field: 'actions',
            minWidth: 150,
            cellRenderer: (incident) => (
                <div>
                <button className="button is-info is-small" 
                    onClick={(event) => {
                        event.stopPropagation(); // Prevent modal pop-up
                        openEditModal(incident.data);
                    }}>
                    Edit
                </button>
                <button className="button is-danger is-small" 
                    onClick={(event) => {
                        event.stopPropagation(); // Prevent modal pop-up
                        handleDeleteIncident(incident.data._id);
                    }}>
                    Delete
                </button>
                {renderStatusActionButton(incident.data)}
            </div>
            ),
        }
    ];

    const handleDeleteSelectedIncidents = async () => {
    if (selectedRows.length === 0) {
        return alert('Please select incidents to delete.');
    }
    
    const confirmed = window.confirm('Are you sure you want to delete the selected incidents?');
    if (!confirmed) return;
    setLoadingDelete(true); // Start loading when file is uploaded


    try {
        // Ubah menjadi async/await untuk setiap penghapusan individual
        const deletePromises = selectedRows.map(async (row) => {
            try {
                await axios.delete(`https://backend-wine-rho.vercel.app/api/insidens/${row._id}`);
            } catch (error) {
                // Tangkap dan log error dari setiap permintaan individu
                console.error(`Error deleting incident with ID ${row.idInsiden}:`, error);
                const errorMessage = error.response?.data?.message || error.message || 'Unknown error occurred.';
                alert(`Failed to delete incident with ID ${row.idInsiden}: ${errorMessage}`);
            }
        });
      
        await Promise.all(deletePromises); // Wait until all deletions are done
            fetchIncidents();  // Refresh data after deletion
            alert('Selected incidents have been deleted successfully.');
        } catch (error) {
            console.error('Error deleting incidents:', error);
            const errorMessage = error.response?.data?.message || 'An unknown error occurred while deleting the selected incidents.';
            alert(`Failed to delete incidents: ${errorMessage}`);
        } finally {
            setLoadingDelete(false);  // Stop loading after process completes
        }
    };


    

    const onGridReady = (params) => {
        setGridApi(params.api);  
        setGridColumnApi(params.columnApi);
    };
    

    return (
        
        <div style={containerStyle}>
            <div><br></br></div>
            <div><br></br></div>
            <div className="ag-theme-alpine" style={gridStyle}>
                <div className="filter-bar">
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={handleSearch}
                        placeholder="Search by ID, Description, Status, or SBU..."
                        className="search-input"
                    />

                    <select value={elapsedFilter} onChange={handleElapsedFilterChange} className="elapsed-filter">
                        <option value="">All Elapsed Times</option>
                        <option value="<4">&lt; 4 hours</option>
                        <option value="<8">&lt; 8 hours</option>
                        <option value="<12">&lt; 12 hours</option>
                        <option value="<24">&lt; 24 hours</option>
                    </select>

                    <button className="button is-success mb-3" onClick={() => setShowModal(true)}>Add New Incident</button>
                    
                    
                    <button onClick={downloadExcel}>Download Excel</button>
                    <button className="button is-success" onClick={downloadSelectedExcel}>
                    Download Selected Excel
                </button>

                  
                    <button 
                    className="button is-danger" 
                    onClick={handleDeleteSelectedIncidents} 
                    disabled={loadingDelete}>
                    {loadingDelete ? 'Deleting...' : 'Delete Selected Incidents'}
                </button>

                


                    <input
                        type="file"
                        accept=".xlsx, .xls"
                        onChange={handleFileUpload}
                        id="fileUpload"
                        style={{ display: 'none' }} // Hide the input, we'll trigger it with a button
                        
                    /> 
            <button 
                    className="button is-primary" 
                    onClick={() => document.getElementById('fileUpload').click()} 
                    disabled={loadingUpload}>
                    {loadingUpload ? 'Uploading...' : 'Upload Excel'}
                </button>
                {loading && <div className="loading-indicator">Loading, please wait...</div>}
                </div>
                
                <AgGridReact
                    rowData={filteredInsidens}
                    columnDefs={columnDefs}
                    defaultColDef={{
                        sortable: true,
                        filter: true,
                        resizable: true,
                    }}
                    pagination={true}
                    paginationPageSize={20}
                    domLayout="autoHeight"
                    rowSelection="multiple"
                    animateRows={true}
                    onSelectionChanged={onSelectionChanged}
                    onRowClicked={onRowClicked}
                    onGridReady={onGridReady}  
                />

                <canvas id="chartCanvas" width="400" height="200"></canvas>

                {showModal && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
                            <FormInsiden addInsiden={handleAddIncident} />
                        </div>
                    </div>
                )}

                {showEditModal && currentIncident && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <button className="modal-close" onClick={() => setShowEditModal(false)}>×</button>
                            <EditFormInsiden ticket={currentIncident} onEdit={handleEditIncident} />
                        </div>
                    </div>
                )}

                {selectedTicket && (
                    <TicketDetails ticket={selectedTicket} onClose={() => setSelectedTicket(null)} />
                )}
                

                {showDetailsModal && modalData && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <button className="modal-close" onClick={() => setShowDetailsModal(false)}>×</button>
                            <h2>Detail Insiden</h2>
                            <p><strong>ID Insiden:</strong> {modalData.idInsiden}</p>
                            <p><strong>Deskripsi:</strong> {modalData.deskripsi}</p>
                            <p><strong>Status:</strong> {modalData.status}</p>
                            <p><strong>Start Date:</strong> {formatDateUTCS(modalData.tanggalSubmit)}</p>
                            <p><strong>SBU:</strong> {modalData.sbu}</p>
                            <p><strong>Kategori:</strong> {modalData.pilihan}</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default InsidenTable;

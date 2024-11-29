import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AgGridReact } from 'ag-grid-react';
import ChatView from './ChatView';
import CloseChatView from './CloseChatView';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import './General.css';
import * as XLSX from 'xlsx';

const General = () => {
    const [tickets, setTickets] = useState([]);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [gridApi, setGridApi] = useState(null);

    // Retrieve user information from localStorage
    const user = JSON.parse(sessionStorage.getItem("user"));
    const fullName = user?.fullName;
    const role = sessionStorage.getItem("role"); // role can be 'admin' or 'user'

    // Fetch tickets on component mount
    useEffect(() => {
        fetchTickets();

        // Set an interval to refresh the ticket data every 5 minutes (or whatever interval you prefer)
        const interval = setInterval(() => {
            fetchTickets();
        }, 1 * 60 * 1000); // 5 minutes in milliseconds

        // Cleanup interval on component unmount
        return () => clearInterval(interval);
    }, []);

    const fetchTickets = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/helpdesk-tickets`);
            const allTickets = response.data;

            // Filter tickets based on the user's role
            const filteredTickets = role === 'admin'
                ? allTickets
                : allTickets.filter(ticket => ticket.createdBy.fullName === fullName);

            setTickets(filteredTickets);

            // Refresh grid rows to update the display without affecting header/filter
            if (gridApi) {
                gridApi.setRowData(filteredTickets);
            }

        } catch (error) {
            console.error("Error fetching tickets:", error);
        }
    };

    const handleRowSelection = (event) => {
        const selectedTicket = event.data;
        setSelectedTicket(selectedTicket);
    };

    const onGridReady = (params) => {
        setGridApi(params.api);
    };

    const exportToExcel = () => {
        const excelData = tickets.map(ticket => ({
            "Created By": ticket.createdBy?.fullName || "Unknown",
            "IP-DA": ticket.subject,
            "Subject": ticket.description,
            "Status": ticket.status,
            "Created Date": formatDate(ticket.createdAt),
        }));

        const worksheet = XLSX.utils.json_to_sheet(excelData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Tickets");
        XLSX.writeFile(workbook, "helpdesk_tickets.xlsx");
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const options = {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true,
        };
        return date.toLocaleString('en-US', options);
    };

    const columns = [
        {
            headerName: 'Created By',
            field: 'createdBy.fullName',
            flex: 1,
            valueFormatter: (params) => params.value || "Unknown"
        },
        { headerName: 'IP-DA', field: 'subject', flex: 1 },
        { headerName: 'Subject', field: 'description', flex: 1 },
        { headerName: 'Status', field: 'status', flex: 1 },
        {
            headerName: 'Created Date',
            field: 'createdAt',
            flex: 1,
            sort: "desc",
            valueFormatter: (params) => formatDate(params.value)
        },
    ];

    return (
        <div className="general-container">
            {selectedTicket ? (
                selectedTicket.status === 'Closed' ? (
                    <CloseChatView selectedTicket={selectedTicket} />
                ) : (
                    <ChatView selectedTicket={selectedTicket} />
                )
            ) : (
                <div>
                    <h2 className="h22">All Helpdesk Tickets</h2>
                    <button onClick={exportToExcel} className="export2">
                        Export to Excel
                    </button>
                    <div className="ag-theme-alpine" style={{ height: 'auto', width: '100%' }}>
                        <AgGridReact
                            rowData={tickets}
                            columnDefs={columns}
                            onGridReady={onGridReady}
                            domLayout="autoHeight"
                            pagination={true}
                            rowSelection="single"
                            defaultColDef={{
                                flex: 1,
                                minWidth: 100,
                                filter: true,
                               
                            }}
                            onRowClicked={handleRowSelection}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default General;

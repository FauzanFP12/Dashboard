// Dashboard.js
import React from 'react';
import './Dashboard.css'; 
import { Doughnut, Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    ArcElement,
    BarElement,
    CategoryScale,
    LinearScale,
    Tooltip,
    Legend
} from 'chart.js';

// Register the required chart elements
ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const STATUS_COLORS = {
    Active: "#8e44ad",
    Check: "#f39c12",
    Completed: "#2ecc71",
    InProgress: "#3498db"
};

const Dashboard = ({ insidenList = [] }) => { // Set default value for insidenList to an empty array
    // Initialize status counters
    const statusCount = {
        Active: 0,
        Check: 0,
        Completed: 0,
        InProgress: 0
    };

    // Count status occurrences in insidenList safely
    insidenList.forEach((insiden) => {
        if (statusCount[insiden.status] !== undefined) {
            statusCount[insiden.status] += 1;
        }
    });

    // Data for Doughnut Chart (Tickets by Priority)
    const priorityData = {
        labels: ['8 Jam', '12 Jam', '24 Jam'],
        datasets: [
            {
                label: 'Tickets by Priority',
                data: [12, 8, 4], // Placeholder data
                backgroundColor: ['#3498db', '#e74c3c', '#2ecc71']
            }
        ]
    };

    // Options for Doughnut Chart
    const priorityOptions = {
        plugins: {
            legend: {
                display: true,
                position: 'top',
                labels: {
                    boxWidth: 20,
                    padding: 10,
                    usePointStyle: true
                }
            }
        }
    };

    // Data for Bar Chart (Unresolved Tickets by Status)
    const unresolvedStatusData = {
        labels: ['Open', 'Pending', 'Resolved', 'Closed'],
        datasets: [
            {
                label: 'Tickets by Status',
                data: [55, 8, 0, 0], // Placeholder data
                backgroundColor: ['#3498db', '#f39c12', '#2ecc71', '#e74c3c']
            }
        ]
    };

    // Options for Unresolved Tickets Bar Chart
    const unresolvedStatusOptions = {
        indexAxis: 'y', // Makes the bar chart horizontal
        responsive: true,
        maintainAspectRatio: true, // Ensure the aspect ratio is maintained
        aspectRatio: 2, // Adjust this value to control the width to height ratio
        scales: {
            x: {
                beginAtZero: true,
                grid: {
                    display: false,
                },
                ticks: {
                    stepSize: 10,
                },
            },
            y: {
                grid: {
                    display: false,
                },
                ticks: {
                    font: {
                        size: 14,
                    },
                    color: '#333',
                },
            },
        },
        plugins: {
            legend: {
                display: false, // Hide the legend
            },
            tooltip: {
                enabled: true,
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                bodyColor: '#fff',
            },
        },
    };

    const statuData = {
        labels: ['JakBan', 'Jatim', 'Sumbagut', 'Bali'],
        datasets: [
            {
                label: 'Insiden Clear Per POP',
                data: [40, 30, 30, 50], // Placeholder data
                backgroundColor: ['#3498db', '#f39c12', '#2ecc71', '#e74c3c']
            }
        ]
    };

    // Options for POP Insiden Clear Bar Chart
    const statusOptions = {
        plugins: {
            legend: {
                display: true,
                position: 'top',
                labels: {
                    boxWidth: 20,
                    padding: 10,
                    usePointStyle: true
                }
            }
        }
    };

    return (
        <div>
            {/* Header Section */}
            <p>  </p>
            <br></br>
            <br></br>

            {/* Ticket Counters */}
            <div className="ticket-counters">
                {[
                    { label: 'Open Tickets', value: 19 },
                    { label: 'Tickets on Hold', value: 6 },
                    { label: 'Unassigned Tickets', value: 5 },
                    { label: 'All Tickets', value: 34 }
                ].map((counter, index) => (
                    <div key={index} className="counter">
                        <h3>{counter.label}</h3>
                        <p>{counter.value}</p>
                    </div>
                ))}
            </div>

            {/* Status Counter Breakdown */}
            <div className="status-counters">
                {Object.entries(statusCount).map(([status, count]) => (
                    <div key={status} className="status" style={{ backgroundColor: STATUS_COLORS[status] }}>
                        <h4>{status}</h4>
                        <p>{count}</p>
                    </div>
                ))}
            </div>

            {/* Chart Section */}
            <div className="charts">
                <div className="chart">
                    <h4>Waktu Yang Dibutuhkan</h4>
                    <Doughnut data={priorityData} options={priorityOptions} />
                </div>
                {/* Insert the Unresolved Tickets by Status Chart here */}
                <div className="chart">
                    <h4>Unresolved Tickets by Status</h4>
                    <br></br><br></br><br></br><br></br>
                    <Bar data={unresolvedStatusData} options={unresolvedStatusOptions} />
                </div>
            </div>
            <br></br>
             <div className="chart">
                    <h4>POP Insiden Clear</h4>
                    <Bar data={statuData} options={statusOptions} />
                </div>
                <br></br>
        </div>
    );
};

export default Dashboard;

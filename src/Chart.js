// src/components/Dashboard.js
import React from 'react';
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

// Register the required elements, scales, etc.
ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const STATUS_COLORS = {
    Active: "#8e44ad",
    Check: "#f39c12",
    Completed: "#2ecc71",
    InProgress: "#3498db"
};

const Dashboard = ({ insidenList }) => {
    // Status counters
    const statusCount = {
        Active: 0,
        Check: 0,
        Completed: 0,
        InProgress: 0
    };

    insidenList.forEach((insiden) => {
        statusCount[insiden.status] += 1;
    });

    // Data for Doughnut Chart (Unresolved Tickets by Priority)
    const priorityData = {
        labels: ['Low', 'Medium', 'High'],
        datasets: [
            {
                label: 'Tickets by Priority',
                data: [12, 8, 4], // These numbers are placeholders
                backgroundColor: ['#3498db', '#e74c3c', '#2ecc71']
            }
        ]
    };

    // Data for Bar Chart (Unresolved Tickets by Status)
    const statusData = {
        labels: ['Open', 'Pending', 'Resolved', 'Closed'],
        datasets: [
            {
                label: 'Tickets by Status',
                data: [55, 8, 0, 0], // Placeholder numbers
                backgroundColor: ['#3498db', '#f39c12', '#2ecc71', '#e74c3c']
            }
        ]
    };
     // Data for Bar Chart (Unresolved Tickets by Status)
     const statuData = {
        labels: ['Open', 'Pending', 'Resolved', 'Closed'],
        datasets: [
            {
                label: 'Tickets by Status',
                data: [55, 8, 0, 0], // Placeholder numbers
                backgroundColor: ['#3498db', '#f39c12', '#2ecc71', '#e74c3c']
            }
        ]
    };

    return (
        <div>
            <h2>Dashboard Insiden</h2>

            {/* Ticket Counters (similar to the top of the second screenshot) */}
            <div className="ticket-counters">
                <div className="counter">
                    <h3>Overdue Tasks</h3>
                    <p>5</p>
                </div>
                <div className="counter">
                    <h3>Tickets Due Today</h3>
                    <p>6</p>
                </div>
                <div className="counter">
                    <h3>Open Tickets</h3>
                    <p>19</p>
                </div>
                <div className="counter">
                    <h3>Tickets on Hold</h3>
                    <p>6</p>
                </div>
                <div className="counter">
                    <h3>Unassigned Tickets</h3>
                    <p>5</p>
                </div>
                <div className="counter">
                    <h3>All Tickets</h3>
                    <p>34</p>
                </div>
            </div>

            {/* Status Counter Breakdown */}
            <div className="status-counters">
                {Object.keys(statusCount).map((status) => (
                    <div key={status} className="status" style={{ backgroundColor: STATUS_COLORS[status] }}>
                        <h4>{status}</h4>
                        <p>{statusCount[status]}</p>
                    </div>
                ))}
            </div>

            {/* Chart Section */}
            <div className="charts">
                <div className="chart">
                    <h4>Unresolved Tickets by Priority</h4>
                    <Doughnut data={priorityData} />
                </div>
                <div className="chart">
                    <h4>Unresolved Tickets by Status</h4>
                    <Bar data={statusData} />
                </div>
            </div>
            <div className="charts">
                <div className="chart">
                    <h4>SBU</h4>
                    <Bar data={statuData} />
                </div>
            </div>
        </div>
    );
};

export default Dashboard;

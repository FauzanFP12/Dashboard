import React, { useEffect, useState } from 'react';
import './Dashboard.css';
import { Doughnut, Bar, Pie, Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    ArcElement,
    BarElement,
    LineElement,
    PointElement,
    CategoryScale,
    LinearScale,
    Tooltip,
    Legend,
} from 'chart.js';
import moment from 'moment'; // For date formatting

// Register the required chart elements
ChartJS.register(ArcElement, BarElement, LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend);

// Define color schemes for status, time, and categories
const STATUS_COLORS = {
    Open: "#3498db",       // Blue for Open
    Closed: "#2ecc71",     // Green for Closed
    InProgress: "#f39c12", // Orange for In Progress
};

const TIME_COLORS = {
    Under4: "#ff6384",   // Red for <4 hours
    Under8: "#36a2eb",   // Blue for <8 hours
    Under12: "#ffcd56",  // Yellow for <12 hours
    Under24: "#4bc0c0",  // Green for <24 hours
};

const CATEGORY_COLORS = {
    Backbone: "#3498db",        // Blue
    SuperBackbone: "#e74c3c",   // Red
    Distribusi: "#f1c40f",      // Yellow
    Access: "#2ecc71",          // Green
};

const Dashboard = ({ insidenList = [], chartData = { sbuStatusData: {}, sbuCategoryData: {} } }) => {
    // Initialize counters for status and elapsed time
    const [statusCount, setStatusCount] = useState({ Open: 0, Closed: 0, InProgress: 0 });
    const [timeCount, setTimeCount] = useState({ under4: 0, under8: 0, under12: 0, under24: 0 });
    const [incidentsOverTime, setIncidentsOverTime] = useState({ labels: [], data: [] });

    // Calculate the number of incidents by status, elapsed time, and incidents over time
    useEffect(() => {
        const tempStatusCount = { Open: 0, Closed: 0, InProgress: 0 };
        const tempTimeCount = { under4: 0, under8: 0, under12: 0, under24: 0 };
        const tempIncidentsOverTime = {};

        insidenList.forEach((insiden) => {
            // Count incidents by status
            if (tempStatusCount[insiden.status] !== undefined) {
                tempStatusCount[insiden.status] += 1;
            }

            // Calculate elapsed time
            const elapsedMilliseconds = new Date() - new Date(insiden.tanggalStart);
            const elapsedHours = Math.floor(elapsedMilliseconds / (1000 * 60 * 60));

            if (elapsedHours < 4) {
                tempTimeCount.under4 += 1;
            } else if (elapsedHours < 8) {
                tempTimeCount.under8 += 1;
            } else if (elapsedHours < 12) {
                tempTimeCount.under12 += 1;
            } else if (elapsedHours < 24) {
                tempTimeCount.under24 += 1;
            }

            // Group incidents by date
            const dateKey = new Date(insiden.tanggalStart).toISOString().split('T')[0]; // YYYY-MM-DD format
            if (!tempIncidentsOverTime[dateKey]) {
                tempIncidentsOverTime[dateKey] = 0;
            }
            tempIncidentsOverTime[dateKey] += 1;
        });

        // Prepare data for the Line Chart
        const sortedDates = Object.keys(tempIncidentsOverTime).sort();
        const incidentsData = sortedDates.map(date => tempIncidentsOverTime[date]);

        // Set updated data in state
        setStatusCount(tempStatusCount);
        setTimeCount(tempTimeCount);
        setIncidentsOverTime({ labels: sortedDates, data: incidentsData });
    }, [insidenList]);

    // Data for the Doughnut Chart (status breakdown)
    const doughnutData = {
        labels: ['Open', 'Closed', 'In Progress'],
        datasets: [
            {
                data: [statusCount.Open, statusCount.Closed, statusCount.InProgress],
                backgroundColor: [STATUS_COLORS.Open, STATUS_COLORS.Closed, STATUS_COLORS.InProgress],
            },
        ],
    };

    const doughnutOptions = {
        plugins: {
            legend: {
                display: true,
                position: 'top',
            },
        },
    };

    // Data for the Pie Chart (elapsed time)
    const timePieData = {
        labels: ['< 4 hours', '< 8 hours', '< 12 hours', '< 24 hours'],
        datasets: [
            {
                data: [timeCount.under4, timeCount.under8, timeCount.under12, timeCount.under24],
                backgroundColor: [TIME_COLORS.Under4, TIME_COLORS.Under8, TIME_COLORS.Under12, TIME_COLORS.Under24],
            },
        ],
    };

    const timePieOptions = {
        plugins: {
            legend: {
                display: true,
                position: 'top',
            },
        },
    };

    // Data for the Grouped Bar Chart (incidents per SBU by status)
    const sbuLabels = Object.keys(chartData.sbuStatusData || {}); // Dynamic SBU labels
    const sbuGroupedBarData = {
        labels: sbuLabels,
        datasets: [
            {
                label: 'Open Tickets',
                data: sbuLabels.map((sbu) => chartData.sbuStatusData[sbu]?.Open || 0),
                backgroundColor: STATUS_COLORS.Open,  
            },
            {
                label: 'Closed Tickets',
                data: sbuLabels.map((sbu) => chartData.sbuStatusData[sbu]?.Closed || 0),
                backgroundColor: STATUS_COLORS.Closed,  
            },
            {
                label: 'In Progress Tickets',
                data: sbuLabels.map((sbu) => chartData.sbuStatusData[sbu]?.InProgress || 0),
                backgroundColor: STATUS_COLORS.InProgress,
            },
        ],
    };

    const sbuGroupedBarOptions = {
        scales: {
            x: {
                stacked: false,  // Grouped bar chart
            },
            y: {
                beginAtZero: true,
            },
        },
        plugins: {
            legend: {
                display: true,
                position: 'top',
            },
        },
    };

    // Data for the Stacked Bar Chart (incidents per category by SBU)
    const categoryStackedBarData = {
        labels: sbuLabels,  // SBU names on the x-axis
        datasets: [
            {
                label: 'Backbone',
                data: sbuLabels.map((sbu) => chartData.sbuCategoryData[sbu]?.Backbone || 0),
                backgroundColor: CATEGORY_COLORS.Backbone,  
            },
            {
                label: 'Super Backbone',
                data: sbuLabels.map((sbu) => chartData.sbuCategoryData[sbu]?.SuperBackbone || 0),
                backgroundColor: CATEGORY_COLORS.SuperBackbone,  
            },
            {
                label: 'Distribusi',
                data: sbuLabels.map((sbu) => chartData.sbuCategoryData[sbu]?.Distribusi || 0),
                backgroundColor: CATEGORY_COLORS.Distribusi,  
            },
            {
                label: 'Access',
                data: sbuLabels.map((sbu) => chartData.sbuCategoryData[sbu]?.Access || 0),
                backgroundColor: CATEGORY_COLORS.Access,
            },
        ],
    };

    const categoryStackedBarOptions = {
        scales: {
            x: {
                stacked: true,  // Stack bars horizontally
            },
            y: {
                beginAtZero: true,
                stacked: true,  // Stack bars vertically
            },
        },
        plugins: {
            legend: {
                display: true,
                position: 'top',
            },
        },
    };

    // Data for the Line Chart (incidents over time)
    const lineChartData = {
        labels: incidentsOverTime.labels, // Dates
        datasets: [
            {
                label: 'Incidents Over Time',
                data: incidentsOverTime.data, // Count of incidents per day
                fill: false,
                borderColor: '#3498db',
                backgroundColor: 'rgba(52, 152, 219, 0.5)',
                tension: 0.1,
            },
        ],
    };

    const lineChartOptions = {
        scales: {
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Number of Incidents', // Y-axis label
                },
            },
            x: {
                title: {
                    display: true,
                    text: 'Date', // X-axis label
                },
            },
        },
    };

    return (
        <div>
            {/* Incident Counters (Total, Open, Closed, In Progress) */}
            <div className="ticket-counters">
                <div className="counter">
                    <h3>Total Incidents</h3>
                    <p>{insidenList.length}</p>
                </div>
                <div className="counter">
                    <h3>Open Tickets</h3>
                    <p>{statusCount.Open}</p>
                </div>
                <div className="counter">
                    <h3>Closed Tickets</h3>
                    <p>{statusCount.Closed}</p>
                </div>
                <div className="counter">
                    <h3>In Progress Tickets</h3>
                    <p>{statusCount.InProgress}</p>
                </div>
            </div>

            {/* Charts */}
            <div className="charts">
                {/* Doughnut Chart for status breakdown */}
                <div className="chart">
                    <h4>Total Incidents by Status</h4>
                    <Doughnut data={doughnutData} options={doughnutOptions} />
                </div>

                {/* Pie Chart for incidents by elapsed time */}
                <div className="chart">
                    <h4>Incidents by Elapsed Time</h4>
                    <Pie data={timePieData} options={timePieOptions} />
                </div>

                {/* Line Chart for incidents over time */}
                <div className="chart full-width">
                    <h4>Incidents Over Time</h4>
                    <Line data={lineChartData} options={lineChartOptions} />
                </div>

                {/* Grouped Bar Chart for incidents per SBU */}
                <div className="chart full-width">
                    <h4>Incidents per SBU (Open, Closed, In Progress)</h4>
                    <Bar data={sbuGroupedBarData} options={sbuGroupedBarOptions} />
                </div>

                {/* Stacked Bar Chart for incidents per Category */}
                <div className="chart full-width">
                    <h4>Incidents per Category (Backbone, Super Backbone, Distribusi, Access)</h4>
                    <Bar data={categoryStackedBarData} options={categoryStackedBarOptions} />
                </div>
            </div>
        </div>
    );
};

export default Dashboard;

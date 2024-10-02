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
import Settings from './Settings'; // Import the Settings component
import Modal from './Modal'; // Import the Modal component for showing filtered incidents

// Register chart.js elements
ChartJS.register(ArcElement, BarElement, LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend);

const Dashboard = ({ insidenList = [] }) => {
    const [visibleCharts, setVisibleCharts] = useState({
        doughnut: true,
        pie: true,
        line: true,
        sbuBar: true,
        categoryBar: true,
    });

    const [settingsVisible, setSettingsVisible] = useState(false); // For showing/hiding the settings modal
    const [isModalOpen, setIsModalOpen] = useState(false); // For showing/hiding the modal
    const [filteredIncidents, setFilteredIncidents] = useState([]); // Store filtered incidents in modal
    const [modalTitle, setModalTitle] = useState(''); // Store modal title
    const [statusCount, setStatusCount] = useState({ Open: 0, Closed: 0, InProgress: 0 });
    const [timeCount, setTimeCount] = useState({ under4: 0, under8: 0, under12: 0, under24: 0 });
    const [incidentsOverTime, setIncidentsOverTime] = useState({ labels: [], data: [] });
    const [sbuStatusData, setSbuStatusData] = useState({}); // For storing SBU chart data
    const [sbuCategoryData, setSbuCategoryData] = useState({}); // For storing category chart data
    const [timeFrame, setTimeFrame] = useState('today'); // State for time frame

    // Function to filter incidents by selected time frame
    const filterIncidentsByTimeFrame = (timeFrame) => {
        const currentTime = new Date();
        return insidenList.filter((insiden) => {
            const incidentTime = new Date(insiden.tanggalStart);
            switch (timeFrame) {
                case 'today':
                    return (
                        incidentTime.getDate() === currentTime.getDate() &&
                        incidentTime.getMonth() === currentTime.getMonth() &&
                        incidentTime.getFullYear() === currentTime.getFullYear()
                    );
                case 'week':
                    const startOfWeek = new Date();
                    startOfWeek.setDate(currentTime.getDate() - currentTime.getDay());
                    return incidentTime >= startOfWeek && incidentTime <= currentTime;
                case 'month':
                    return (
                        incidentTime.getMonth() === currentTime.getMonth() &&
                        incidentTime.getFullYear() === currentTime.getFullYear()
                    );
                default:
                    return true;
            }
        });
    };

    // Recalculate data based on timeFrame and insidenList
    useEffect(() => {
        const filteredIncidents = filterIncidentsByTimeFrame(timeFrame);
        
        const tempStatusCount = { Open: 0, Closed: 0, InProgress: 0 };
        const tempTimeCount = { under4: 0, under8: 0, under12: 0, under24: 0 };
        const tempIncidentsOverTime = {};
        const tempSbuStatusData = {};
        const tempSbuCategoryData = {};

        filteredIncidents.forEach((insiden) => {
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

            // Group incidents by date for line chart
            const dateKey = new Date(insiden.tanggalStart).toISOString().split('T')[0];
            if (!tempIncidentsOverTime[dateKey]) {
                tempIncidentsOverTime[dateKey] = 0;
            }
            tempIncidentsOverTime[dateKey] += 1;

            // Group incidents by SBU and status for bar charts
            if (!tempSbuStatusData[insiden.sbu]) {
                tempSbuStatusData[insiden.sbu] = { Open: 0, Closed: 0, InProgress: 0 };
            }
            tempSbuStatusData[insiden.sbu][insiden.status] += 1;

            // Group incidents by SBU and category for bar charts
            if (!tempSbuCategoryData[insiden.sbu]) {
                tempSbuCategoryData[insiden.sbu] = { Backbone: 0, SuperBackbone: 0, Distribusi: 0, Access: 0 };
            }
            tempSbuCategoryData[insiden.sbu][insiden.pilihan] += 1;
        });

        const sortedDates = Object.keys(tempIncidentsOverTime).sort();
        const incidentsData = sortedDates.map((date) => tempIncidentsOverTime[date]);

        setStatusCount(tempStatusCount);
        setTimeCount(tempTimeCount);
        setIncidentsOverTime({ labels: sortedDates, data: incidentsData });
        setSbuStatusData(tempSbuStatusData);
        setSbuCategoryData(tempSbuCategoryData);
    }, [insidenList, timeFrame]); // Add timeFrame to the dependency array

    // Function to handle opening the modal and filtering incidents
    const openModalWithType = (type) => {
        let filteredData = [];
        let title = '';

        switch (type) {
            case 'All':
                filteredData = insidenList;
                title = 'All Incidents';
                break;
            case 'Open':
                filteredData = insidenList.filter((insiden) => insiden.status === 'Open');
                title = 'Open Incidents';
                break;
            case 'Closed':
                filteredData = insidenList.filter((insiden) => insiden.status === 'Closed');
                title = 'Closed Incidents';
                break;
            case 'InProgress':
                filteredData = insidenList.filter((insiden) => insiden.status === 'InProgress');
                title = 'In Progress Incidents';
                break;
            default:
                break;
        }

        setFilteredIncidents(filteredData);
        setModalTitle(title);
        setIsModalOpen(true); // Show the modal
    };

    // Close the modal
    const closeModal = () => {
        setIsModalOpen(false);
        setFilteredIncidents([]);
    };

    // Handle saving settings
    const handleSaveSettings = () => {
        console.log('Settings Saved:', visibleCharts);
    };

    // Toggle visibility of charts
    const handleToggleChart = (chart) => {
        setVisibleCharts((prev) => ({ ...prev, [chart]: !prev[chart] }));
    };

    // Data for the Doughnut Chart (status breakdown)
    const doughnutData = {
        labels: ['Open', 'Closed', 'In Progress'],
        datasets: [
            {
                data: [statusCount.Open, statusCount.Closed, statusCount.InProgress],
                backgroundColor: ['#3498db', '#2ecc71', '#f39c12'],
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
                backgroundColor: ['#ff6384', '#36a2eb', '#ffcd56', '#4bc0c0'],
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
    const sbuLabels = Object.keys(sbuStatusData); // Dynamic SBU labels
    const sbuGroupedBarData = {
        labels: sbuLabels,
        datasets: [
            {
                label: 'Open Tickets',
                data: sbuLabels.map((sbu) => sbuStatusData[sbu]?.Open || 0),
                backgroundColor: '#3498db',
            },
            {
                label: 'Closed Tickets',
                data: sbuLabels.map((sbu) => sbuStatusData[sbu]?.Closed || 0),
                backgroundColor: '#2ecc71',
            },
            {
                label: 'In Progress Tickets',
                data: sbuLabels.map((sbu) => sbuStatusData[sbu]?.InProgress || 0),
                backgroundColor: '#f39c12',
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
                data: sbuLabels.map((sbu) => sbuCategoryData[sbu]?.Backbone || 0),
                backgroundColor: '#3498db',
            },
            {
                label: 'Super Backbone',
                data: sbuLabels.map((sbu) => sbuCategoryData[sbu]?.SuperBackbone || 0),
                backgroundColor: '#e74c3c',
            },
            {
                label: 'Distribusi',
                data: sbuLabels.map((sbu) => sbuCategoryData[sbu]?.Distribusi || 0),
                backgroundColor: '#f1c40f',
            },
            {
                label: 'Access',
                data: sbuLabels.map((sbu) => sbuCategoryData[sbu]?.Access || 0),
                backgroundColor: '#2ecc71',
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
            {/* Settings Modal */}
            {settingsVisible && (
                <Settings
                    visibleCharts={visibleCharts}
                    onToggleChart={handleToggleChart}
                    onClose={() => setSettingsVisible(false)}
                    onSave={handleSaveSettings}
                />
            )}

            {/* Modal for displaying filtered incidents */}
            {isModalOpen && (
                <Modal onClose={closeModal}>
                    <h2>{modalTitle}</h2>
                    <ul>
                        {filteredIncidents.map((insiden, index) => (
                            <li key={index}>
                                ID: {insiden.idInsiden} | Status: {insiden.status} | Description: {insiden.deskripsi} 
                            </li>
                        ))}
                    </ul>
                </Modal>
            )}

            {/* Button to open settings */}
            <button className="settings-button" onClick={() => setSettingsVisible(true)}>
                Settings
            </button>
            <br></br><br></br>
            <br></br>

            {/* Time Frame Selector */}
            <div className="time-frame-selector">
                <button onClick={() => setTimeFrame('today')} className={timeFrame === 'today' ? 'active' : ''}>Today</button>
                <button onClick={() => setTimeFrame('week')} className={timeFrame === 'week' ? 'active' : ''}>This Week</button>
                <button onClick={() => setTimeFrame('month')} className={timeFrame === 'month' ? 'active' : ''}>This Month</button>
            </div>

            <div className="ticket-counters">
                <div className="counter" onClick={() => openModalWithType('All')}>
                    <h3>Total Incidents</h3>
                    <p>{insidenList.length}</p>
                </div>
                <div className="counter" onClick={() => openModalWithType('Open')}>
                    <h3>Open Tickets</h3>
                    <p>{statusCount.Open}</p>
                </div>
                <div className="counter" onClick={() => openModalWithType('Closed')}>
                    <h3>Closed Tickets</h3>
                    <p>{statusCount.Closed}</p>
                </div>
                <div className="counter" onClick={() => openModalWithType('InProgress')}>
                    <h3>In Progress Tickets</h3>
                    <p>{statusCount.InProgress}</p>
                </div>
            </div>

            {/* Chart Section */}
            <div className="charts">
                {visibleCharts.doughnut && (
                    <div className="chart">
                        <h4>Total Incidents by Status</h4>
                        <Doughnut data={doughnutData} options={doughnutOptions} />
                    </div>
                )}

                {/* Add other chart components as per your requirements */}
                {visibleCharts.pie && (
                    <div className="chart">
                        <h4>Incidents by Elapsed Time</h4>
                        <Pie data={timePieData} options={timePieOptions} />
                    </div>
                )}

                {visibleCharts.line && (
                    <div className="chart full-width">
                        <h4>Incidents Over Time</h4>
                        <Line data={lineChartData} options={lineChartOptions} />
                    </div>
                )}

                {visibleCharts.sbuBar && (
                    <div className="chart full-width">
                        <h4>Incidents per SBU (Open, Closed, In Progress)</h4>
                        <Bar data={sbuGroupedBarData} options={sbuGroupedBarOptions} />
                    </div>
                )}

                {visibleCharts.categoryBar && (
                    <div className="chart full-width">
                        <h4>Incidents per Category (Backbone, Super Backbone, Distribusi, Access)</h4>
                        <Bar data={categoryStackedBarData} options={categoryStackedBarOptions} />
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;

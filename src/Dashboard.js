import React, { useEffect, useState } from 'react';
import './Dashboard.css';
import { Doughnut, Bar, Pie, Line, Radar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    ArcElement,
    BarElement,
    LineElement,
    CategoryScale,
    LinearScale,
    Tooltip,
    Legend,
    RadialLinearScale,
} from 'chart.js';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import sankey from 'highcharts/modules/sankey';
import treemap from 'highcharts/modules/treemap';
import heatmap from 'highcharts/modules/heatmap';
import 'chartjs-plugin-datalabels';
import Settings from './Settings';

// Register Highcharts modules
heatmap(Highcharts);
sankey(Highcharts);
treemap(Highcharts);

// Register chart.js elements
ChartJS.register(
    ArcElement, BarElement, LineElement, CategoryScale, LinearScale, Tooltip, Legend, RadialLinearScale
);

// Define the getColor function before you use it
const getColor = (index) => {
    const colors = [
        'rgba(75, 192, 192, 0.2)',
        'rgba(255, 99, 132, 0.2)',
        'rgba(54, 162, 235, 0.2)',
        'rgba(255, 206, 86, 0.2)',
        'rgba(153, 102, 255, 0.2)',
        'rgba(255, 159, 64, 0.2)'
    ];
    const borderColors = [
        'rgba(75, 192, 192, 1)',
        'rgba(255, 99, 132, 1)',
        'rgba(54, 162, 235, 1)',
        'rgba(255, 206, 86, 1)',
        'rgba(153, 102, 255, 1)',
        'rgba(255, 159, 64, 1)'
    ];
    return {
        backgroundColor: colors[index % colors.length],
        borderColor: borderColors[index % borderColors.length]
    };
};

const Dashboard = ({ insidenList = [] }) => {
    const [visibleCharts, setVisibleCharts] = useState({
        doughnut: true,
        pie: true,
        line: true,
        sbuBar: true,
        categoryBar: true,
        radarChart: true,
        sankeyDiagram: true,
        treemapChart: true
    });

    const [settingsVisible, setSettingsVisible] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [filteredIncidents, setFilteredIncidents] = useState([]);
    const [modalTitle, setModalTitle] = useState('');
    const [statusCount, setStatusCount] = useState({ Open: 0, Closed: 0, InProgress: 0 });
    const [timeCount, setTimeCount] = useState({ under4: 0, under8: 0, under12: 0, under24: 0 });
    const [incidentsOverTime, setIncidentsOverTime] = useState({ labels: [], data: [] });
    const [sbuStatusData, setSbuStatusData] = useState({});
    const [sbuCategoryData, setSbuCategoryData] = useState({});
    const [timeFrame, setTimeFrame] = useState('today');
    const [totalIncidents, setTotalIncidents] = useState(0);
    const [selectedSbu, setSelectedSbu] = useState('All');
    const [customStartDate, setCustomStartDate] = useState('');
    const [customEndDate, setCustomEndDate] = useState('');

    useEffect(() => {
        const filteredIncidents = filterIncidentsByTimeFrame(timeFrame);

        const tempStatusCount = { Open: 0, Closed: 0, InProgress: 0 };
        const tempTimeCount = { under4: 0, under8: 0, under12: 0, under24: 0 };
        const tempIncidentsOverTime = {};
        const tempSbuStatusData = {};
        const tempSbuCategoryData = {};

        filteredIncidents.forEach((insiden) => {
            if (tempStatusCount[insiden.status] !== undefined) {
                tempStatusCount[insiden.status] += 1;
            }

            const elapsedMilliseconds = new Date() - new Date(insiden.tanggalSubmit);
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

            const dateKey = new Date(insiden.tanggalSubmit).toISOString().split('T')[0];
            if (!tempIncidentsOverTime[dateKey]) {
                tempIncidentsOverTime[dateKey] = 0;
            }
            tempIncidentsOverTime[dateKey] += 1;

            if (!tempSbuStatusData[insiden.sbu]) {
                tempSbuStatusData[insiden.sbu] = { Open: 0, Closed: 0, InProgress: 0 };
            }
            tempSbuStatusData[insiden.sbu][insiden.status] += 1;

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
        setTotalIncidents(filteredIncidents.length);
    }, [insidenList, timeFrame, customStartDate, customEndDate]);

    const handleSbuSelection = (e) => {
        setSelectedSbu(e.target.value);
    };

    const filterIncidentsByTimeFrame = (timeFrame) => {
        const currentTime = new Date();
        return insidenList.filter((insiden) => {
            const incidentTime = new Date(insiden.tanggalSubmit);
            switch (timeFrame) {
                case 'today':
                    return (
                        incidentTime.getDate() === currentTime.getDate() &&
                        incidentTime.getMonth() === currentTime.getMonth() &&
                        incidentTime.getFullYear() === currentTime.getFullYear()
                    );
                case 'week':
                    const startOfWeek = new Date(currentTime);
                    startOfWeek.setDate(currentTime.getDate() - currentTime.getDay());
                    return incidentTime >= startOfWeek && incidentTime <= currentTime;
                case 'month':
                    return (
                        incidentTime.getMonth() === currentTime.getMonth() &&
                        incidentTime.getFullYear() === currentTime.getFullYear()
                    );
                case 'custom':
                    const startDate = new Date(customStartDate);
                    const endDate = new Date(customEndDate);
                    return incidentTime >= startDate && incidentTime <= endDate;
                default:
                    return true;
            }
        });
    };

    // Apply time filter before opening the modal
    const openModalWithType = (type) => {
        const filteredData = filterIncidentsByTimeFrame(timeFrame);
        let filteredTypeData = [];
        let title = '';

        switch (type) {
            case 'All':
                filteredTypeData = filteredData;
                title = 'All Incidents';
                break;
            case 'Open':
                filteredTypeData = filteredData.filter((insiden) => insiden.status === 'Open');
                title = 'Open Incidents';
                break;
            case 'Closed':
                filteredTypeData = filteredData.filter((insiden) => insiden.status === 'Closed');
                title = 'Closed Incidents';
                break;
            case 'InProgress':
                filteredTypeData = filteredData.filter((insiden) => insiden.status === 'InProgress');
                title = 'In Progress Incidents';
                break;
            default:
                break;
        }

        setFilteredIncidents(filteredTypeData);
        setModalTitle(title);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setFilteredIncidents([]);
    };

    const handleToggleChart = (chart) => {
        setVisibleCharts((prev) => ({ ...prev, [chart]: !prev[chart] }));
    };

    const doughnutData = {
        labels: ['Open', 'Closed', 'InProgress'],
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
                position: 'right',
            },
        },
        onClick: (evt, elements) => {
            if (elements.length > 0) {
                const chartIndex = elements[0].index;
                handleChartClick('status', doughnutData, chartIndex);
            }
        },
    };

    const timePieData = {
        labels: ['< 4 hours', '< 8 hours', '< 12 hours', '< 24 hours'],
        datasets: [
            {
                data: [timeCount.under4, timeCount.under8, timeCount.under12, timeCount.under24],
                backgroundColor: ['#ff6384', '#36a2eb', '#ffcd56', '#4bc0c0'],
            },
        ],
    };
    const handleChartClick = (dataType, chartData, chartIndex) => {
        let filteredTypeData = [];
        let title = '';

        switch (dataType) {
            case 'status': {
                const status = chartData.labels[chartIndex];
                filteredTypeData = insidenList.filter(incident => incident.status === status);
                title = `${status} Incidents`;
                break;
            }
            case 'elapsedTime': {
                const timeRange = chartData.labels[chartIndex];
                filteredTypeData = insidenList.filter(incident => {
                    const elapsedMilliseconds = new Date() - new Date(incident.tanggalSubmit);
                    const elapsedHours = Math.floor(elapsedMilliseconds / (1000 * 60 * 60));
                    switch (timeRange) {
                        case '< 4 hours': return elapsedHours < 4;
                        case '< 8 hours': return elapsedHours < 8;
                        case '< 12 hours': return elapsedHours < 12;
                        case '< 24 hours': return elapsedHours < 24;
                        default: return false;
                    }
                });
                title = `Incidents within ${timeRange}`;
                break;
            }
            case 'sbu': {
                const sbu = chartData.labels[chartIndex];
                filteredTypeData = insidenList.filter(incident => incident.sbu === sbu);
                title = `Incidents in ${sbu}`;
                break;
            }
            case 'category': {
                const category = chartData.labels[chartIndex];
                filteredTypeData = insidenList.filter(incident => incident.pilihan === category);
                title = `Incidents of ${category}`;
                break;
            }
            case 'date': {
                const date = chartData.labels[chartIndex];
                filteredTypeData = insidenList.filter(incident => new Date(incident.tanggalSubmit).toISOString().split('T')[0] === date);
                title = `Incidents on ${date}`;
                break;
            }
            default:
                break;
        }

        setFilteredIncidents(filteredTypeData);
        setModalTitle(title);
        setIsModalOpen(true);
    };

    const timePieOptions = {
        plugins: {
            legend: {
                display: true,
                position: 'right',
            },
        },
        onClick: (evt, elements) => {
            if (elements.length > 0) {
                const chartIndex = elements[0].index;
                handleChartClick('elapsedTime', timePieData, chartIndex);
            }
        },
    };
    const sbuLabels = Object.keys(sbuStatusData);
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
            x: { stacked: false },
            y: { beginAtZero: true },
        },
        plugins: {
            legend: { display: true, position: 'top' },
        },
        onClick: (evt, elements) => {
            if (elements.length > 0) {
                const chartIndex = elements[0].index;
                handleChartClick('sbu', sbuGroupedBarData, chartIndex);
            }
        },
    };

    const categoryStackedBarData = {
        labels: sbuLabels,
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
                stacked: true,
            },
            y: {
                beginAtZero: true,
                stacked: true,
            },
        },
        plugins: {
            legend: {
                display: true,
                position: 'right',
            },
        },
        onClick: (evt, elements) => {
            if (elements.length > 0) {
                const chartIndex = elements[0].index;
                handleChartClick('sbu', categoryStackedBarData, chartIndex);
            }
        },
    };

    const lineChartData = {
        labels: incidentsOverTime.labels,
        datasets: [
            {
                label: 'Incidents Over Time',
                data: incidentsOverTime.data,
                fill: false,
                borderColor: '#3498db',
                backgroundColor: 'rgba(52, 152, 219, 0.5)',
                tension: 0.1,
            },
        ],
    };

    const lineChartOptions = {
        scales: {
            y: { beginAtZero: true, title: { display: true, text: 'Number of Incidents' } },
            x: { title: { display: true, text: 'Date' } },
        },
        onClick: (evt, elements) => {
            if (elements.length > 0) {
                const chartIndex = elements[0].index;
                handleChartClick('date', lineChartData, chartIndex);
            }
        },
    };


    const radarChartData = {
        labels: ['Backbone', 'SuperBackbone', 'Distribusi', 'Access'], // Categories for radar chart
        datasets: selectedSbu === 'All'
            ? Object.keys(sbuCategoryData).map((sbu, index) => {
                const { backgroundColor, borderColor } = getColor(index); // Generate unique color for each SBU
                return {
                    label: `Incident Distribution - ${sbu}`,
                    data: [
                        sbuCategoryData[sbu]?.Backbone || 0,
                        sbuCategoryData[sbu]?.SuperBackbone || 0,
                        sbuCategoryData[sbu]?.Distribusi || 0,
                        sbuCategoryData[sbu]?.Access || 0
                    ],
                    backgroundColor,
                    borderColor,
                    borderWidth: 2,
                };
            })
            : [{
                label: `Incident Distribution - ${selectedSbu}`,
                data: [
                    sbuCategoryData[selectedSbu]?.Backbone || 0,
                    sbuCategoryData[selectedSbu]?.SuperBackbone || 0,
                    sbuCategoryData[selectedSbu]?.Distribusi || 0,
                    sbuCategoryData[selectedSbu]?.Access || 0
                ],
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 2,
            }],
    };
    
    

    const radarChartOptions = {
        scales: { r: { angleLines: { display: false }, suggestedMin: 0, suggestedMax: 5 } },
        plugins: { legend: { display: true, position: 'bottom' } },
        onClick: (evt, elements) => {
            if (elements.length > 0) {
                const chartIndex = elements[0].index;
                handleChartClick('category', radarChartData, chartIndex);
            }
        },
    };


   // Utility function to count flows for Sankey
   const countFlows = (data, fromKey, toKey) => {
    const flowMap = {};
    data.forEach((insiden) => {
        const from = insiden[fromKey];
        const to = insiden[toKey];
        const flowKey = `${from}-${to}`;
        if (!flowMap[flowKey]) {
            flowMap[flowKey] = 0;
        }
        flowMap[flowKey] += 1;
    });
    return Object.entries(flowMap).map(([key, weight]) => {
        const [from, to] = key.split('-');
        return [from, to, weight];
    });
};

// Define colors for each "Category" (Pilihan)
const categoryColors = {
    'Backbone': '#3498db',
    'Super Backbone': '#e74c3c',
    'Distribusi': '#f1c40f',
    'Access': '#2ecc71'
};

// Filter incidents based on selected timeframe
const filteredData = filterIncidentsByTimeFrame(timeFrame);

// Generate Sankey data with colors
const sankeyData = [
    // From "Category" (Pilihan) to "SBU"
    ...countFlows(filteredData, 'pilihan', 'sbu').map(flow => ({
        from: flow[0], to: flow[1], weight: flow[2], color: categoryColors[flow[0]]
    })),
    // From "SBU" to "Status"
    ...countFlows(filteredData, 'sbu', 'status').map(flow => ({
        from: flow[0], to: flow[1], weight: flow[2], color: categoryColors[flow[0]]
    }))
];

// Pareto chart logic
const paretoChartData = {
    labels: Object.keys(sbuCategoryData),
    datasets: [
        {
            label: 'Incidents by Category',
            data: Object.values(sbuCategoryData).map((category) => category.Backbone),
            backgroundColor: '#3498db',
        },
        
    ],
};

const paretoChartOptions = {
    scales: {
        x: {
            beginAtZero: true,
        },
        y: {
            beginAtZero: true,
            type: 'linear',
            position: 'left',
        },
    },
};
const handleHighchartsClick = (chartType, point) => {
    let filteredTypeData = [];
    let title = '';

    if (chartType === 'sankey') {
        // Filter incidents based on the flow between "from" and "to" in Sankey chart
        if (point.isNode) {
            // Handle node click (if it's only 'from' or 'to')
            filteredTypeData = insidenList.filter(incident => 
                incident.pilihan === point.name || incident.sbu === point.name || incident.status === point.name
            );
            title = `Incidents for ${point.name}`;
        } else {
            // Handle link click (between 'from' and 'to')
            filteredTypeData = insidenList.filter(incident =>
                (incident.pilihan === point.from && incident.sbu === point.to) ||
                (incident.sbu === point.from && incident.status === point.to)
            );
            title = `Incidents from ${point.from} to ${point.to}`;
        }

    } else if (chartType === 'treemap') {
        // Handle Treemap click based on SBU (point.name contains the SBU name)
        filteredTypeData = insidenList.filter(incident => incident.sbu === point.name);
        title = `Incidents for SBU: ${point.name}`;
    }

    // Update modal data and open the modal with the filtered incidents
    setFilteredIncidents(filteredTypeData);
    setModalTitle(title);
    setIsModalOpen(true);
};




const sankeyChartOptions = {
    title: {
        text: 'Incident Flow by Category, SBU, and Status',
    },
    series: [
        {
            keys: ['from', 'to', 'weight'], // Keys indicating data mapping for sankey chart
            data: sankeyData.map(flow => [flow.from, flow.to, flow.weight]), // Mapping your flow data into the required format
            type: 'sankey',
            name: 'Incident Flow',
            linkColorByTarget: true,  // Color each flow by the target node
            colors: Object.values(categoryColors), // Apply your custom colors for the flows

            // Handling click event to trigger modal
            events: {
                click: function (event) {
                    // Ensure the event.point contains the required data
                    if (event.point) {
                        handleHighchartsClick('sankey', event.point); // Call the handler function with the event point data
                    }
                }
            },

            dataLabels: {
                color: '#333',
                enabled: true,
                
            },
        },
    ],
    tooltip: {
        pointFormat: '<b>{point.from}</b> → <b>{point.to}</b>: {point.weight}', // Tooltip format for displaying flow data
    },
    plotOptions: {
        series: {
            cursor: 'pointer', // Show pointer cursor on hover
        },
    }
};


    

    const treemapChartOptions = {
        series: [{
            type: 'treemap',
            layoutAlgorithm: 'squarified',
            data: sbuLabels.map((sbu, index) => ({
                name: sbu,
                value: Object.values(sbuCategoryData[sbu] || {}).reduce((acc, val) => acc + val, 0),
                colorValue: index + 1,
            })),
            events: {
                click: function (event) {
                    handleHighchartsClick('treemap', event.point);
                }
            }

        }],
        title: {
            text: 'Incident Breakdown by SBU and Category',
        },
    };

    return (
        <div>
            <div><br></br></div><div><br></br></div><div><br></br></div>
        <div className="dashboard-container">
            
            {settingsVisible && (
                <Settings
                    visibleCharts={visibleCharts}
                    onToggleChart={handleToggleChart}
                    onClose={() => setSettingsVisible(false)}
                />
            )}
            

            <div className="time-frame-selector">
                <button onClick={() => setTimeFrame('today')} className={timeFrame === 'today' ? 'active' : ''}>
                    Today
                </button>
                <button onClick={() => setTimeFrame('week')} className={timeFrame === 'week' ? 'active' : ''}>
                    This Week
                </button>
                <button onClick={() => setTimeFrame('month')} className={timeFrame === 'month' ? 'active' : ''}>
                    This Month
                </button>
                <div>
                    <input
                        type="date"
                        value={customStartDate}
                        onChange={(e) => setCustomStartDate(e.target.value)}
                        placeholder="Start Date"
                    />
                    <input
                        type="date"
                        value={customEndDate}
                        onChange={(e) => setCustomEndDate(e.target.value)}
                        placeholder="End Date"
                    />
                    <button onClick={() => setTimeFrame('custom')}>Filter by Date Range</button>
                </div>
            </div>

            <div className="ticket-counters">
                <div className="counter" onClick={() => openModalWithType('All')}>
                    <h3>Total Incidents</h3>
                    <p>{totalIncidents}</p>
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

            <div className="charts">
                {visibleCharts.doughnut && (
                    <div className="chart">
                        <h4>Status Breakdown</h4>
                        <Doughnut data={doughnutData} options={doughnutOptions} />
                    </div>
                )}
                {visibleCharts.treemapChart && (
                    <div className="chart full-width">
                        <h4>Incident Breakdown Treemap</h4>
                        <HighchartsReact highcharts={Highcharts} options={treemapChartOptions} />
                    </div>
                )}


                {visibleCharts.pie && (
                    <div className="chart">
                        <h4>Incidents by Elapsed Time</h4>
                        <Pie data={timePieData} options={timePieOptions} />
                    </div>
                )}

<div className={`chart chart-large`} >
    <h4>Incidents per SBU (Open, Closed, In Progress)</h4>
    <Bar data={sbuGroupedBarData} options={sbuGroupedBarOptions} />
</div>
<div className={`chart chart-large`}  >
    <h4>Incidents per Category (Backbone, Super Backbone, Distribusi, Access)</h4>
    <Bar data={categoryStackedBarData} options={categoryStackedBarOptions} />
</div>
<div className={`chart chart-large`} >
    <h4>Incidents Over Time</h4>
    <Line data={lineChartData} options={lineChartOptions} />
</div>


                


                {visibleCharts.radarChart && (
                    <div className="chart full-width">
                        <h4>Incident Distribution by Category and SBU</h4>
                        <div className="sbu-dropdown">
                            <label>Select SBU: </label>
                            <select value={selectedSbu} onChange={handleSbuSelection}>
                                <option value="All">All</option>
                                {Object.keys(sbuCategoryData).map((sbu) => (
                                    <option key={sbu} value={sbu}>
                                        {sbu}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <Radar data={radarChartData} options={radarChartOptions} />
                    </div>
                )}
                {visibleCharts.paretoChart && (
<div className="chart chart-large">
    <h4>Pareto Chart of Incident Categories</h4>
    <Bar data={paretoChartData} options={paretoChartOptions} />
</div>
)}

                {visibleCharts.sankeyDiagram && (
                    <div className="chart full-width">
                        <h4>Sankey Diagram of Incident Flow</h4>
                        <HighchartsReact highcharts={Highcharts} options={sankeyChartOptions} />
                    </div>
                )}

                
                {isModalOpen && (
                    <div className="modal-overlay">
                        <div className="modal-content">
                            <button className="modal-close" onClick={closeModal}>×</button>
                            <h2>{modalTitle}</h2>
                            <div className="modal-scrollable">
                                <ul>
                                    {filteredIncidents.map((insiden, index) => (
                                        <li key={index}>
                                            ID: {insiden.idInsiden} | Status: {insiden.status} | Description: {insiden.deskripsi}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
        </div>
    );
};

export default Dashboard;

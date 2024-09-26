// UnresolvedTicketsChart.js
import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const UnresolvedTicketsChart = () => {
  // Data for the chart
  const data = {
    labels: ['Open', 'Pending', 'Resolved', 'Closed'],
    datasets: [
      {
        label: 'Tickets',
        data: [55, 8, 0, 0], // Example data; adjust as needed
        backgroundColor: ['#007bff', '#17a2b8', '#2ecc71', '#6c757d'],
        borderColor: ['#0056b3', '#138496', '#1e7e34', '#343a40'],
        borderWidth: 1,
        barThickness: 20, // Adjust the bar thickness
      },
    ],
  };

  // Options to customize the appearance
  const options = {
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

  return (
    <div
      style={{
        width: '300px',
        height: '200px', // Set a fixed height for the chart
        padding: '20px',
        margin: '0 auto',
        border: '1px solid #ddd',
        borderRadius: '8px',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
        backgroundColor: '#fff',
      }}
    >
      <h4 style={{ textAlign: 'center', marginBottom: '10px', color: '#0056b3' }}>
        Unresolved Tickets by Status
      </h4>
      <Bar data={data} options={options} />
    </div>
  );
};

export default UnresolvedTicketsChart;

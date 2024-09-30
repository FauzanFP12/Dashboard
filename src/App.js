import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, NavLink } from 'react-router-dom';
import Dashboard from './Dashboard';
import FormInsiden from './FormInsiden';
import InsidenTable from './InsidenTable';
import Sidebar from './Sidebar';
import Header from './Header';
import './App.css';
import axios from 'axios';

const App = () => {
    const [insidenList, setInsidenList] = useState([]); // State for incident list
    const [chartData, setChartData] = useState([]); // State for chart data
    const [isSidebarOpen, setIsSidebarOpen] = useState(true); // State to control sidebar visibility

    // Fetch incidents from API when the app loads
    const getInsidens = async () => {
        try {
            const response = await axios.get('http://localhost:5000/api/insidens');
            setInsidenList(response.data); // Update insiden list
            calculateChartData(response.data); // Update chart data
        
        } catch (error) {
            console.error('Error fetching incidents:', error);
        }
    };

    // Calculate the chart data based on incidents
    const calculateChartData = (incidents) => {
        const currentTime = new Date();
        const chartData = incidents.map((insiden) => {
            const elapsedMilliseconds = currentTime - new Date(insiden.tanggalStart);
            const elapsedHours = Math.floor(elapsedMilliseconds / (1000 * 60 * 60));
            return { ...insiden, elapsedHours };
        });
        setChartData(chartData); // Update chart data
    };

    // Handler to toggle the sidebar
    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen); // Toggle sidebar open/close state
    };

    // Fetch the incidents from the API on mount
    useEffect(() => {
        getInsidens(); // Fetch data on app load
    }, []);

    return (
        <Router>
            <div className="app-container">
                <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} /> {/* Pass state and toggle function */}
                <div className="main-content">
                    <Header toggleSidebar={toggleSidebar} /> {/* Add Header */}
                    <nav className="tabs-navigation">
                        <NavLink to="/" className={({ isActive }) => isActive ? 'active' : ''}>Dashboard</NavLink>
                        <NavLink to="/insiden-table" className={({ isActive }) => isActive ? 'active' : ''}>Insiden Table</NavLink>
                    </nav>
                    <Routes>
                        <Route 
                            path="/" 
                            element={<Dashboard insidenList={insidenList} chartData={chartData} />} 
                        />
                        <Route 
                            path="/form-insiden" 
                            element={<FormInsiden getInsidens={getInsidens} />} 
                        />
                        <Route 
                            path="/insiden-table" 
                            element={<InsidenTable setChartData={setChartData} />} 
                        />
                    </Routes>
                </div>
            </div>
        </Router>
    );
};

export default App;

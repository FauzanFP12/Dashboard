import React, { useState, useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom'; // useLocation here
import Dashboard from './Dashboard';
import FormInsiden from './FormInsiden';
import InsidenTable from './InsidenTable';
import Sidebar from './Sidebar';
import Header from './Header';
import Login from './Login';
import General from './General'
import Antrian from './Antrian'
import './App.css';
import axios from 'axios';
import MapIndonesia from './MapIndonesia';
import Chat from './Chat';
import CloseChat from './CloseChat';
import HelpDesk from './HelpDesk';
import ProtectedRoute from './ProtectedRoutes';

import ChatView from './ChatView';
import CloseChatView from './CloseChatView';
import Register from './Register';



const App = () => {
    const [insidenList, setInsidenList] = useState([]); // State for incident list
    const [chartData, setChartData] = useState([]); // State for chart data
    const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Sidebar closed by default
    const [loading, setLoading] = useState(false); // State to control loading indicator
    const location = useLocation(); // useLocation hook here

    // Fetch incidents from API when the app loads
    const getInsidens = async () => {
        setLoading(true); // Start loading
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/insidens`);
            setInsidenList(response.data); // Update incident list
            calculateChartData(response.data); // Update chart data
        } catch (error) {
            console.error('Error fetching incidents:', error);
        } finally {
            setLoading(false); // End loading
        }
    };

    // Calculate the chart data based on incidents
    const calculateChartData = (incidents) => {
        const currentTime = new Date();
        const updatedChartData = incidents.map((insiden) => {
            const elapsedMilliseconds = currentTime - new Date(insiden.tanggalStart);
            const elapsedHours = Math.floor(elapsedMilliseconds / (1000 * 60 * 60));
            return { ...insiden, elapsedHours }; // Add elapsed time to each incident
        });
        setChartData(updatedChartData); // Update chart data
    };

    // Handler to toggle the sidebar
    const toggleSidebar = () => {
        setIsSidebarOpen((prevState) => !prevState); // Toggle sidebar open/close state
    };

    // Fetch the incidents from the API on mount
    useEffect(() => {
        getInsidens(); // Fetch data on app load
    }, []);

    return (
        <div className="app-container">
            {/* Only show Sidebar if not on /login route */}
            {location.pathname !== '/login' && (
                <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
            )}

            <div className="app-main-content">
                {/* Always show Header */}
                <Header toggleSidebar={toggleSidebar} />
                
                {/* Show loading indicator when fetching data */}
                {loading ? (
                    <div className="app-loading-indicator">Loading...</div>
                ) : (
                    
                    <Routes>
                        <Route 
                            path="/" 
                            element={<ProtectedRoute requiredRole="admin"><Dashboard insidenList={insidenList} chartData={chartData} /></ProtectedRoute>} 
                            
                        />
                        <Route 
                            path="/form-insiden" 
                            element={<ProtectedRoute requiredRole="admin"><FormInsiden getInsidens={getInsidens} /></ProtectedRoute>} 
                        />
                        <Route 
    path="/insiden-table" 
    element={<ProtectedRoute requiredRole="admin"><InsidenTable setChartData={setChartData} getInsidens={getInsidens} /></ProtectedRoute>} 
/>

                        <Route 
                            path="/map-insiden" 
                            element={<ProtectedRoute><MapIndonesia /></ProtectedRoute>} 
                        />
                        <Route 
                            path="/login" 
                            element={<Login />} 
                            
                        />
                         <Route 
                            path="/help-desk/view" 
                            element={<ProtectedRoute><General/></ProtectedRoute>} 
                            
                        />
                        <Route 
                            path="/help-desk/create" 
                            element={<ProtectedRoute><HelpDesk/></ProtectedRoute>} 
                            
                        />
                         <Route 
                            path="/help-desk/general" 
                            element={<ProtectedRoute><Chat/></ProtectedRoute>} 
                            
                        />
                         <Route 
                            path="/help-desk/close" 
                            element={<ProtectedRoute><CloseChat/></ProtectedRoute>} 
                            
                        />
                         <Route path="/" element={<General />} />
        <Route path="/chat" element={<ChatView />} />
        <Route path="/close-chat" element={<CloseChatView />} />
                       
        <Route 
                            path="/register" 
                            element={<Register/>} 
                            
                        />
                    </Routes>

                )}
            </div>
        </div>
    );
};

export default App;

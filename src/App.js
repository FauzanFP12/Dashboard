// App.js
import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, NavLink } from 'react-router-dom';
import Dashboard from './Dashboard';
import FormInsiden from './FormInsiden';
import InsidenTable from './InsidenTable';
import Sidebar from './Sidebar';
import './App.css';

const App = () => {
    const [insidenList, setInsidenList] = useState([]);
    const [isOpen, setIsOpen] = useState(true);

    // Function to add a new incident to the list
    const addInsiden = (newInsiden) => {
        setInsidenList([...insidenList, newInsiden]);
    };

    // Function to toggle sidebar visibility
    const toggleSidebar = () => {
        setIsOpen(!isOpen);
    };

    return (
        <Router>
            <div className="app-container">
                <Sidebar isOpen={isOpen} toggleSidebar={toggleSidebar} />
                <div className="main-content">
                    <header className="header">
                        <h1>Manajemen Insiden</h1>
                        <button onClick={toggleSidebar}>
                            {isOpen ? 'Hide Sidebar' : 'Show Sidebar'}
                        </button>
                    </header>
                    <nav className="tabs-navigation">
                        <NavLink to="/" className={({ isActive }) => isActive ? 'active' : ''}>Dashboard</NavLink>
                        <NavLink to="/form-insiden" className={({ isActive }) => isActive ? 'active' : ''}>Form Insiden</NavLink>
                        <NavLink to="/insiden-table" className={({ isActive }) => isActive ? 'active' : ''}>Insiden Table</NavLink>
                    </nav>
                    <Routes>
                        <Route path="/" element={<Dashboard insidenList={insidenList} />} />
                        <Route path="/form-insiden" element={<FormInsiden addInsiden={addInsiden} />} />
                        <Route path="/insiden-table" element={<InsidenTable insidenList={insidenList} />} />
                    </Routes>
                </div>
            </div>
        </Router>
    );
};

export default App;

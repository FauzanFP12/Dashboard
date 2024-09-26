// Sidebar.js
import React from 'react';
import './Sidebar.css';

const Sidebar = ({ isOpen, toggleSidebar }) => {
    return (
        <div className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
            <button onClick={toggleSidebar} className="sidebar-toggle">
                {isOpen ? 'Close Sidebar' : 'Open Sidebar'}
            </button>
            {isOpen && (
                <ul>
                    <li><a href="/">Dashboard</a></li>
                    <li><a href="/form-insiden">Form Insiden</a></li>
                    <li><a href="/insiden-table">Insiden Table</a></li>
                </ul>
            )}
        </div>
    );
};

export default Sidebar;

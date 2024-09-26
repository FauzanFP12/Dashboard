import React from 'react';
import './Header.css'; // Optional: Add your styles here

const Header = ({ toggleSidebar }) => {
    return (
        <header className="app-header">
            <button className="sidebar-toggle" onClick={toggleSidebar}>
                Toggle Sidebar
            </button>
            <h1>Manajemen Insiden</h1>
        </header>
    );
};

export default Header;

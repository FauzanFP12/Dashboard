import React from 'react';
import './Sidebar.css';

const Sidebar = ({ isOpen, toggleSidebar }) => {
    return (
        <div className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
           
            {isOpen && (
                <ul>
                    <br></br><br></br>
                    <li><a href="/">Dashboard</a></li>
                    
                    <li><a href="/insiden-table">Insiden Table</a></li>
                </ul>
            )}
        </div>
    );
};

export default Sidebar;

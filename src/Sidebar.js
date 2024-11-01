import React from 'react';
import './Sidebar.css';

const Sidebar = ({ isOpen, toggleSidebar }) => {
    return (
        <div className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
            {isOpen && (
                <nav>
                    <ul><br></br><br></br>
                        <li>
                            <a href="/">Dashboard</a>
                        </li>
                        <li>
                            <a href="/map-insiden">Map Insiden</a>
                        </li>
                        <li>
                            <a href="/insiden-table">Insiden Table</a>
                        </li>
                    </ul>
                </nav>
            )}
        </div>
    );
};

export default Sidebar;

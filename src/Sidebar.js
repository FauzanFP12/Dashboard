import React, { useState } from 'react';
import { Link } from 'react-router-dom';  // Pastikan Link digunakan untuk navigasi internal
import './Sidebar.css';

const Sidebar = ({ isOpen, toggleSidebar }) => {
    const [isHelpDeskOpen, setHelpDeskOpen] = useState(false);
    const role = sessionStorage.getItem('role'); // Ambil role dari localStorage

    // Fungsi untuk toggle dropdown Help Desk
    const toggleHelpDeskDropdown = () => {
        setHelpDeskOpen(!isHelpDeskOpen);
    };

    return (
        <div className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
            {isOpen && (
                <nav>
                    <ul><br /><br />
                    {/* Hanya tampilkan Insiden Table untuk admin */}
                    {role === 'admin' && (
                        <li>
                            <Link to="/">Dashboard</Link>
                        </li>
                        )}
                        {/* Hanya tampilkan Insiden Table untuk admin */}
                        {role === 'admin' && (
                        <li>
                            <Link to="/map-insiden">Map Insiden</Link>
                        </li>
                         )}
                        
                        {/* Hanya tampilkan Insiden Table untuk admin */}
                        {role === 'admin' && (
                            <li>
                                <Link to="/insiden-table">Insiden Table</Link>
                            </li>
                        )}

                        <li>
                            <a onClick={toggleHelpDeskDropdown} href="#!">Help Desk</a>
                            {isHelpDeskOpen && (
                                <ul className="dropdown">
                                    {role === 'admin' && (
                                    <li><Link to="/help-desk/view">General</Link></li>
                                )}
                                {role === 'user' && (
                                    <li><Link to="/help-desk/create">Create Chat</Link></li>
                                )}
                                    <li><Link to="/help-desk/general">Open Chat</Link></li>
                                    <li><Link to="/help-desk/close">Close Chat</Link></li>
                                </ul>
                            )}
                        </li>
                    </ul>
                </nav>
            )}
        </div>
    );
};

export default Sidebar;

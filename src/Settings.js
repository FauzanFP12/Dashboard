import React from 'react';
import './Settings.css';

const Settings = ({ visibleCharts, onToggleChart, onClose, onSave }) => {
    const handleSave = () => {
        onSave(); // Call the save function to persist changes
        onClose(); // Close the modal after saving
    };

    return (
        <div className="settings-modal">
            <div className="modal-content">
                <button className="modal-close" onClick={onClose}>
                    &times;
                </button>
                <h2>Customize Dashboard</h2>
                <form className="settings-form">
                    <label>
                        <input
                            type="checkbox"
                            checked={visibleCharts.doughnut}
                            onChange={() => onToggleChart('doughnut')}
                        />
                        Total Incidents by Status
                    </label>
                    <label>
                        <input
                            type="checkbox"
                            checked={visibleCharts.pie}
                            onChange={() => onToggleChart('pie')}
                        />
                        Incidents by Elapsed Time
                    </label>
                    <label>
                        <input
                            type="checkbox"
                            checked={visibleCharts.line}
                            onChange={() => onToggleChart('line')}
                        />
                        Incidents Over Time
                    </label>
                    <label>
                        <input
                            type="checkbox"
                            checked={visibleCharts.sbuBar}
                            onChange={() => onToggleChart('sbuBar')}
                        />
                        Incidents per SBU
                    </label>
                    <label>
                        <input
                            type="checkbox"
                            checked={visibleCharts.categoryBar}
                            onChange={() => onToggleChart('categoryBar')}
                        />
                        Incidents per Category
                    </label>
                    <button type="button" onClick={handleSave}>
                        Save Changes
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Settings;

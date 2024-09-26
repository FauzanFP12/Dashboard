// MainDashboard.js
import React, { useState } from 'react';
import FormInsiden from './FormInsiden';
import InsidenTable from './InsidenTable';
import './MainDashboard.css';

const MainDashboard = () => {
  const [insidenData, setInsidenData] = useState([]);
  const [activeTab, setActiveTab] = useState('form'); // Control which tab is active

  const addInsiden = (newInsiden) => {
    setInsidenData([...insidenData, newInsiden]);
  };

  return (
    <div className="main-dashboard">
      <div className="tabs">
        <button onClick={() => setActiveTab('form')} className={activeTab === 'form' ? 'active' : ''}>
          Form Insiden
        </button>
        <button onClick={() => setActiveTab('table')} className={activeTab === 'table' ? 'active' : ''}>
          Insiden Table
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'form' && <FormInsiden addInsiden={addInsiden} />}
        {activeTab === 'table' && <InsidenTable insidenData={insidenData} />}
      </div>
    </div>
  );
};

export default MainDashboard;

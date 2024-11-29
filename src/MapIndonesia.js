import Highcharts from 'highcharts/highmaps';
import HighchartsReact from 'highcharts-react-official';
import indonesiaMap from './id/id-all.geo.json'; // GeoJSON Indonesia
import { useEffect, useState } from 'react';
import './PetaIndonesia.css';

import axios from 'axios'; // For fetching data from backend
import { AgGridReact } from 'ag-grid-react'; // Import ag-Grid
import 'ag-grid-community/styles/ag-grid.css'; // ag-Grid styles
import 'ag-grid-community/styles/ag-theme-alpine.css'; // ag-Grid theme

// Mapping Nama Provinsi ke Kode GeoJSON
const namaKeKodeProvinsi = {
  "ACEH": "id-ac",
  "JAKARTA & BANTEN": "id-bt-jk", // New combined key for Jakarta and Banten
  "SUMATERA BAGIAN UTARA": "id-su",
  "SUMATERA BAGIAN SELATAN": "id-sl",
  "JAWA BAGIAN BARAT": "id-jr",
  "JAWA BAGIAN TENGAH": "id-jt",
  "JAWA BAGIAN TIMUR": "id-ji",
  "SULAWESI BAGIAN BARAT": "id-sr",
  "SUMATERA BAGIAN BARAT": "id-sb",
  "PAPUA": "id-pa",
  "NUSA TENGGARA TIMUR": "id-nt",
  "NUSA TENGGATA BARAT": "id-nb",
  "SUMATERA BAGIAN TENGAH": "id-ri",
  "MALUKU UTARA": "id-la",
  "JAMBI": "id-ja",
  "BENGKULU": "id-be",
  "LAMPUNG": "id-1024",
  "MALUKU": "id-ma",
  "PAPUA BARAT": "id-ib",
  "SULAWESI UTARA": "id-sw",
  "SULAWESI TENGAH": "id-st",
  "SULAWESI TENGGARA": "id-sg",
  "SULAWESI & INDONESIA TIMUR": "id-se",
  "GORONTALO": "id-go",
  "KALIMANTAN UTARA": "id-ku",
  "KALIMANRAN TIMUR": "id-kt",
  "KALIMANTAN": "id-kalimantan",
  "KALIMANTAN BARAT": "id-kb",
  "KALIMANTAN TENGAH": "id-ki",
  "BANGKA BELITUNG": "id-bb",
  "KEPULAUAN RIAU": "id-kr",
  "BALI & NUSA TENGGARA": "id-ba"
};

const PetaIndonesia = () => {
  const [dataPeta, setDataPeta] = useState([]);
  const [allInsidens, setAllInsidens] = useState([]);
  const [insidenPerProvinsi, setInsidenPerProvinsi] = useState([]);
  const [selectedProvinsi, setSelectedProvinsi] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // Filter for map
  const [statusFilterTable, setStatusFilterTable] = useState('all'); // Filter for table
  const [sbuFilter, setSbuFilter] = useState('all'); // Filter for SBU
  const [totalIncidents, setTotalIncidents] = useState({ open: 0, closed: 0, total: 0 }); // Store total incident counts

  // Fetch data from API
  const fetchData = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/insidens`);
      setAllInsidens(response.data);
    } catch (error) {
      console.error('Gagal mengambil data insiden:', error);
    }
  };

  useEffect(() => {
    // Initial fetch when the component is mounted
    fetchData();

    // Set interval to fetch data every 5 minutes (300000 ms)
    const intervalId = setInterval(() => {
      fetchData();
    }, 10000);

    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const updateMapData = () => {
      const filteredInsidens = statusFilter === 'all'
        ? allInsidens
        : allInsidens.filter(insiden => insiden.status === statusFilter);

      const jumlahPerProvinsi = filteredInsidens.reduce((acc, insiden) => {
        if (insiden.sbu === "Jakarta" || insiden.sbu === "Banten") {
          acc["Jakban"] = (acc["Jakban"] || 0) + 1;
        } else {
          const kodeProvinsi = namaKeKodeProvinsi[insiden.sbu] || null;
          if (kodeProvinsi) {
            acc[kodeProvinsi] = (acc[kodeProvinsi] || 0) + 1;
          }
        }
        return acc;
      }, {});

      const provinsiData = Object.entries(jumlahPerProvinsi).map(
        ([kodeProvinsi, jumlah]) => [kodeProvinsi, jumlah]
      );

      setDataPeta(provinsiData);

      // Update the total incident counts
      const openIncidents = filteredInsidens.filter(insiden => insiden.status === 'Open').length;
      const closedIncidents = filteredInsidens.filter(insiden => insiden.status === 'Closed').length;
      setTotalIncidents({
        open: openIncidents,
        closed: closedIncidents,
        total: filteredInsidens.length
      });
    };

    updateMapData();
  }, [statusFilter, allInsidens]);
  const formatDateUTCS = (dateString) => {
    if (!dateString) return "";

    // Convert the date to the user's local time by adding 7 hours
    const date = new Date(dateString);
    const gmt7Date = new Date(date.getTime() + 0 * 60 * 60 * 1000); // Adjust to GMT+7

    // Format the date to 'id-ID' locale in GMT+7 without converting back to UTC
    return gmt7Date.toLocaleString("id-ID", {
      month: "numeric",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
      hour12: false, // To ensure 24-hour format
    });
  };
  const handleProvinsiClick = (provinsi) => {
    const insidenTerkait = allInsidens.filter((insiden) =>
      provinsi === namaKeKodeProvinsi[insiden.sbu] &&
      (statusFilter === 'all' || insiden.status === statusFilter) &&
      (sbuFilter === 'all' || insiden.sbu === sbuFilter)
    );

    setSelectedProvinsi(provinsi);
    setInsidenPerProvinsi(insidenTerkait);
  };

  const handleFilterChange = (filter) => {
    setStatusFilter(filter);
    setSelectedProvinsi('');
    setInsidenPerProvinsi([]);
  };

  const columnDefs = [
    { headerName: 'ID Insiden', field: 'idInsiden' },
    { headerName: 'Deskripsi', field: 'deskripsi',  autoHeight: true, flex: 3 },
    { headerName: 'Status', field: 'status' },
    { headerName: 'SBU', field: 'sbu' },
    { headerName: 'Kategori', field: 'pilihan' },
    { headerName: 'Prioritas', field: 'priority' },
    {
      field: "tanggalSubmit",
      headerName: "Start Incident",
      valueFormatter: (params) => formatDateUTCS(params.value),
      filter: "agDateColumnFilter",
      sortable: true,
    },
   
  ];

  const options = {
    chart: { map: indonesiaMap },
    title: { text: 'Peta Insiden Indonesia' },
    colorAxis: { min: 0, minColor: '#E0F7FA', maxColor: '#00796B' },
    series: [
      {
        data: dataPeta,
        mapData: indonesiaMap,
        joinBy: 'hc-key',
        name: 'Jumlah Insiden',
        states: { hover: { color: '#FF7043' } },
        tooltip: { valueSuffix: ' insiden' },
        point: {
          events: {
            click: function () {
              handleProvinsiClick(this['hc-key']);
            },
          },
        },
        dataLabels: {
          enabled: true, // Enable data labels
          format: '{point.value}', // Show the number of incidents
          style: {
            color: 'black', // Label color
            fontSize: '14px', // Font size for the labels
            fontWeight: 'bold', // Bold font for the labels
          },
          align: 'center', // Center the text on the region
          verticalAlign: 'middle', // Center the text vertically
        },
      },
    ],
  };

  return (
    <div style={{ marginTop: '100px', width: '100%', maxWidth: 'flex' }}>
      <HighchartsReact
        highcharts={Highcharts}
        options={options}
        domLayout="autoHeight"
        constructorType={'mapChart'}
        containerProps={{ style: { height: '600px', width: '100%' } }}
      />

      {/* Only show the total incidents table if no region is selected */}
      {['all', 'Open', 'Closed'].includes(statusFilter) && !selectedProvinsi && (
        <div style={{ marginTop: '20px' }}>
          <h2>Total Insiden</h2>
          <table>
            <thead>
              <tr>
                <th>Status</th>
                <th>Jumlah</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Open</td>
                <td>{totalIncidents.open}</td>
              </tr>
              <tr>
                <td>Closed</td>
                <td>{totalIncidents.closed}</td>
              </tr>
              <tr>
                <td>Total</td>
                <td>{totalIncidents.total}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* Show ag-Grid table with incidents for a specific province */}
      {selectedProvinsi && (
        <div className="ag-theme-alpine" style={{ height: '400px', width: '100%' }}>
          <AgGridReact
            columnDefs={columnDefs}
            rowData={insidenPerProvinsi}
            pagination={true}
            paginationPageSize={10}
          />
        </div>
      )}

      {/* Status Filter Buttons */}
      <div style={{ position: 'fixed', bottom: '20px', right: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {['all', 'Open', 'Closed'].map((filter) => (
          <button
            key={filter}
            onClick={() => handleFilterChange(filter)}
            style={{
              padding: '10px 20px',
              backgroundColor: statusFilter === filter ? '#00796B' : '#E0E0E0',
              color: statusFilter === filter ? 'white' : 'black',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
            }}
          >
             {filter.charAt(0).toUpperCase() + filter.slice(1)}
          </button>
        ))}
      </div>
    </div>
  );
};

export default PetaIndonesia;

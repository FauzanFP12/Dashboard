import Highcharts from 'highcharts/highmaps';
import HighchartsReact from 'highcharts-react-official';
import indonesiaMap from '@highcharts/map-collection/countries/id/id-all.geo.json'; // GeoJSON Indonesia
import { useEffect, useState } from 'react';
import './PetaIndonesia.css';

import axios from 'axios'; // Untuk mengambil data dari API backend

// Mapping Nama Provinsi ke Kode GeoJSON
const namaKeKodeProvinsi = {
  "Aceh": "id-ac",
  "Jakban": "id-jk-bt", // New combined key for Jakarta and Banten
  "Banten": "id-bt", // Keep the original mapping if needed
  "Jakarta": "id-jk",
  "Jakarta Timur": "id-jk",
  "Jakarta Barat": "id-jk",
  "Jakarta Selatan": "id-jk",
  "Sumatera Utara": "id-su",
  "Sumatera Selatan": "id-sl",
  "Jawa Barat": "id-jr",
  "Jawa Tengah": "id-jt",
  "Jawa Timur": "id-ji",
  "Sulawesi Barat": "id-sr",
  "Sumatera Barat": "id-sb",
  "Papua": "id-pa",
  "Nusa Tenggara Timur": "id-nt",
  "Nusa Tenggara Barat": "id-nb",
  "Riau": "id-ri",
  "Maluku Utara": "id-la",
  "Jambi": "id-ja",
  "Bengkulu": "id-be",
  "Lampung": "id-1024",
  "Maluku": "id-ma",
  "Papua Barat": "id-ib",
  "Sulawesi Utara": "id-sw",
  "Sulawesi Tengah": "id-st",
  "Sulawesi Tenggara": "id-sg",
  "Sulawesi Selatan": "id-se",
  "Gorontalo": "id-go",
  "Kalimantan Utara": "id-ku",
  "Kalimantan Timur": "id-kt",
  "Kalimantan Selatan": "id-ks",
  "Kalimantan Barat": "id-kb",
  "Kalimantan Tengah": "id-ki",
  "Bangka Belitung": "id-bb",
  "Kepulauan Riau": "id-kr",
  "Bali": "id-ba"
};


const PetaIndonesia = () => {
  const [dataPeta, setDataPeta] = useState([]);
  const [allInsidens, setAllInsidens] = useState([]);
  const [insidenPerProvinsi, setInsidenPerProvinsi] = useState([]);
  const [selectedProvinsi, setSelectedProvinsi] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // Filter untuk peta
  const [statusFilterTable, setStatusFilterTable] = useState('all'); // Filter untuk tabel
  const [sbuFilter, setSbuFilter] = useState('all'); // Filter untuk SBU

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://10.128.168.209:5000/api/insidens');
        setAllInsidens(response.data);
      } catch (error) {
        console.error('Gagal mengambil data insiden:', error);
      }
    };
    fetchData();
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
    };
    updateMapData();
  }, [statusFilter, allInsidens]);

  const handleProvinsiClick = (provinsi) => {
    const insidenTerkait = allInsidens.filter((insiden) =>
      provinsi === namaKeKodeProvinsi[insiden.sbu] &&
      (statusFilter === 'all' || insiden.status === statusFilter) &&
      (sbuFilter === 'all' || insiden.sbu === sbuFilter)
    );

    setSelectedProvinsi(provinsi);
    setInsidenPerProvinsi(insidenTerkait);
  };

  

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
      },
    ],
  };

  const handleFilterChange = (filter) => {
    setStatusFilter(filter);
    setSelectedProvinsi('');
    setInsidenPerProvinsi([]);
  };

 
  return (
    <div style={{ marginTop: '100px', width: '100%', maxWidth: 'flex' }}>
      <HighchartsReact
        highcharts={Highcharts}
        options={options}
        constructorType={'mapChart'}
        containerProps={{ style: { height: '600px', width: '100%' } }}
      />

      {selectedProvinsi && (
        <div style={{ marginTop: '20px' }}>
          <h2 className="h2">Data Insiden di Provinsi: {selectedProvinsi}</h2>

          <table className="insiden-table">
            <thead>
              <tr>
                <th>ID Insiden</th>
                <th>Deskripsi</th>
                <th>Status</th>
                <th>SBU</th>
                <th>Kategori</th>
                <th>Prioritas</th>
              </tr>
            </thead>
            <tbody>
              {insidenPerProvinsi.map((insiden, index) => (
                <tr key={index}>
                  <td>{insiden.idInsiden}</td>
                  <td>{insiden.deskripsi}</td>
                  <td>{insiden.status}</td>
                  <td>{insiden.sbu}</td>
                  <td>{insiden.pilihan}</td>
                  <td>{insiden.priority}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Combined Filter Area at Bottom Right */}
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
            Tampilkan {filter.charAt(0).toUpperCase() + filter.slice(1)}
          </button>
        ))}
      </div>
    </div>
  );
};

export default PetaIndonesia;

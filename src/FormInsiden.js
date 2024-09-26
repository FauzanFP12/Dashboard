// FormInsiden.js
import React, { useState } from 'react';
import './FormInsiden.css';

const FormInsiden = ({ addInsiden }) => {
  const [insiden, setInsiden] = useState({
    id: '',
    deskripsi: '',
    status: 'Open',
    tanggalStart: '',
    durasi: '',
    sbu: '',
    backbone: '',
    superbackbone: '',
    distribusi: '',
    access: '',
    pilihan: 'Backbone',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setInsiden({
      ...insiden,
      [name]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate that duration must be positive
    if (insiden.durasi <= 0) {
      alert("Durasi insiden harus lebih besar dari 0!");
      return;
    }

    // Add new incident to the list
    addInsiden(insiden);

    // Reset form after submit
    setInsiden({
      id: '',
      deskripsi: '',
      status: 'Open',
      tanggalStart: '',
      durasi: '',
      sbu: '',
      backbone: '',
      superbackbone: '',
      distribusi: '',
      access: '',
      pilihan: 'Backbone',
      
    });
  };

  return (
    <form onSubmit={handleSubmit} className="form-insiden">
      <div className="form-group">
        <label>ID Insiden:</label>
        <input
          type="text"
          name="id"
          value={insiden.id}
          onChange={handleChange}
          placeholder="Masukkan ID Insiden"
          required
        />
      </div>
      <div className="form-group">
        <label>Deskripsi Insiden:</label>
        <textarea
          name="deskripsi"
          value={insiden.deskripsi}
          onChange={handleChange}
          placeholder="Deskripsikan insiden..."
          required
        />
      </div>
      <div className="form-group">
        <label>Status:</label>
        <select name="status" value={insiden.status} onChange={handleChange}>
          <option value="Open">Open</option>
          <option value="In Progress">In Progress</option>
          <option value="Closed">Closed</option>
        </select>
      </div>
      <div className="form-group">
        <label>Tanggal Start:</label>
        <input
          type="date"
          name="tanggalStart"
          value={insiden.tanggalStart}
          onChange={handleChange}
          required
        />
      </div>
      <div className="form-group">
        <label>Durasi (jam):</label>
        <input
          type="number"
          name="durasi"
          value={insiden.durasi}
          onChange={handleChange}
          placeholder="Durasi dalam jam"
          required
        />
      </div>
      <div className="form-group">
        <label>SBU:</label>
        <input
          type="text"
          name="sbu"
          value={insiden.sbu}
          onChange={handleChange}
          placeholder="Masukkan SBU"
          required
        />
      </div>
      <div className="form-group">
        <label>Backbone:</label>
        <input
          type="text"
          name="backbone"
          value={insiden.backbone}
          onChange={handleChange}
          placeholder="Masukkan Backbone"
          required
        />
      </div>
      <div className="form-group">
        <label>Super Backbone:</label>
        <input
          type="text"
          name="superbackbone"
          value={insiden.superbackbone}
          onChange={handleChange}
          placeholder="Masukkan Super Backbone"
          required
        />
      </div>
      <div className="form-group">
        <label>Distribusi:</label>
        <input
          type="text"
          name="distribusi"
          value={insiden.distribusi}
          onChange={handleChange}
          placeholder="Masukkan Distribusi"
          required
        />
      </div>
      <div className="form-group">
        <label>Access:</label>
        <input
          type="text"
          name="access"
          value={insiden.access}
          onChange={handleChange}
          placeholder="Masukkan Access"
          required
        />
      </div>
      <div className="form-group">
        <label>Pilihan:</label>
        <select name="pilihan" value={insiden.pilihan} onChange={handleChange}>
          <option value="Backbone">Backbone</option>
          <option value="Super Backbone">Super Backbone</option>
          <option value="Distribusi">Distribusi</option>
          <option value="Access">Access</option>
          
        </select>
      </div>
      <button type="submit" className="submit-button">Tambah Insiden</button>
    </form>
  );
};

export default FormInsiden;

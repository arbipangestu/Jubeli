'use client';

import React, { useState } from 'react';

const VehicleListingForm: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Basic state for form (In production use React Hook Form)
  const [formData, setFormData] = useState({
    title: '',
    brand: '',
    model: '',
    year: new Date().getFullYear(),
    price: '',
    transmission: 'Automatic',
    mileage: '',
    location_province: '',
    location_city: '',
    description: '',
    user_id: 1, // Hardcoded for demo
    category_id: 1 // Hardcoded for demo
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload = {
        ...formData,
        price: parseFloat(formData.price),
        mileage: parseInt(formData.mileage),
        year: parseInt(formData.year as any),
        // Mock image for demo
        images: ['https://via.placeholder.com/800x600.png?text=Vehicle+Image']
      };

      const res = await fetch('/api/vehicles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error('Failed to create listing');

      alert('Iklan berhasil dibuat!');
      // Reset form or redirect
    } catch (err) {
      setError('Terjadi kesalahan saat memposting iklan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Pasang Iklan Kendaraan</h2>

      {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Judul Iklan</label>
          <input
            type="text"
            name="title"
            required
            className="mt-1 block w-full border rounded-md p-2"
            value={formData.title}
            onChange={handleChange}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Merk (Brand)</label>
            <input type="text" name="brand" required className="mt-1 block w-full border rounded-md p-2" value={formData.brand} onChange={handleChange} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Model</label>
            <input type="text" name="model" required className="mt-1 block w-full border rounded-md p-2" value={formData.model} onChange={handleChange} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Tahun</label>
            <input type="number" name="year" required className="mt-1 block w-full border rounded-md p-2" value={formData.year} onChange={handleChange} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Transmisi</label>
            <select name="transmission" className="mt-1 block w-full border rounded-md p-2" value={formData.transmission} onChange={handleChange}>
              <option value="Automatic">Automatic</option>
              <option value="Manual">Manual</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Harga (Rp)</label>
          <input type="number" name="price" required className="mt-1 block w-full border rounded-md p-2" value={formData.price} onChange={handleChange} />
        </div>

        <div>
           <label className="block text-sm font-medium text-gray-700">Kilometer (KM)</label>
           <input type="number" name="mileage" required className="mt-1 block w-full border rounded-md p-2" value={formData.mileage} onChange={handleChange} />
        </div>

        <div className="grid grid-cols-2 gap-4">
           <div>
             <label className="block text-sm font-medium text-gray-700">Provinsi</label>
             <input type="text" name="location_province" required className="mt-1 block w-full border rounded-md p-2" value={formData.location_province} onChange={handleChange} />
           </div>
           <div>
             <label className="block text-sm font-medium text-gray-700">Kota</label>
             <input type="text" name="location_city" required className="mt-1 block w-full border rounded-md p-2" value={formData.location_city} onChange={handleChange} />
           </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Deskripsi</label>
          <textarea name="description" rows={4} className="mt-1 block w-full border rounded-md p-2" value={formData.description} onChange={handleChange}></textarea>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white font-bold py-3 rounded-md hover:bg-blue-700 transition disabled:opacity-50"
        >
          {loading ? 'Memproses...' : 'Pasang Iklan Sekarang'}
        </button>
      </div>
    </form>
  );
};

export default VehicleListingForm;

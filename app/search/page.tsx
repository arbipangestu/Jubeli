'use client';

import React, { useState, useEffect } from 'react';
import VehicleCard from '@/components/vehicle/VehicleCard';

export default function SearchPage() {
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter state
  const [filters, setFilters] = useState({
    brand: '',
    minPrice: '',
    maxPrice: '',
    yearMin: '',
    yearMax: ''
  });

  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (filters.brand) queryParams.append('brand', filters.brand);
      if (filters.yearMin) queryParams.append('year_min', filters.yearMin);

      const res = await fetch(`/api/vehicles?${queryParams.toString()}`);
      const data = await res.json();
      setVehicles(data.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []); // Initial load

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchVehicles();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Sidebar Filters */}
        <div className="md:col-span-1">
          <div className="bg-white p-4 rounded-lg shadow sticky top-4">
            <h2 className="font-bold text-lg mb-4">Filter Pencarian</h2>
            <form onSubmit={handleSearch} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Merk</label>
                <input
                  type="text"
                  name="brand"
                  className="w-full border rounded p-2"
                  placeholder="Toyota, Honda..."
                  value={filters.brand}
                  onChange={handleFilterChange}
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                 <div>
                   <label className="text-sm font-medium">Tahun Min</label>
                   <input
                     type="number"
                     name="yearMin"
                     className="w-full border rounded p-2"
                     placeholder="2015"
                     value={filters.yearMin}
                     onChange={handleFilterChange}
                   />
                 </div>
                 <div>
                   <label className="text-sm font-medium">Max</label>
                   <input
                     type="number"
                     name="yearMax"
                     className="w-full border rounded p-2"
                     placeholder="2024"
                     value={filters.yearMax}
                     onChange={handleFilterChange}
                   />
                 </div>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white font-bold py-2 rounded hover:bg-blue-700"
              >
                Terapkan Filter
              </button>
            </form>
          </div>
        </div>

        {/* Results Grid */}
        <div className="md:col-span-3">
          {loading ? (
             <div className="text-center py-10">Memuat data...</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {vehicles.map((v) => (
                <a key={v.id} href={`/vehicle/${v.id}`} className="block">
                  <VehicleCard
                    id={v.id}
                    image={v.images?.[0]?.image_url || ''}
                    title={v.title}
                    price={parseFloat(v.price)}
                    year={v.year}
                    transmission={v.transmission}
                    location={v.location_city}
                  />
                </a>
              ))}
              {vehicles.length === 0 && (
                <div className="col-span-full text-center py-10 text-gray-500">
                  Tidak ada kendaraan yang ditemukan.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

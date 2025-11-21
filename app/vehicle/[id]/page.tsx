import React from 'react';
import VehicleDetails from '@/components/vehicle/VehicleDetails';

// Helper to fetch data on server
async function getVehicle(id: string) {
  // In a real Server Component, you can call DB directly or fetch API
  // Calling API internally requires full URL
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/vehicles/${id}`, {
    cache: 'no-store'
  });

  if (!res.ok) return null;
  return res.json();
}

export default async function Page({ params }: { params: { id: string } }) {
  const vehicle = await getVehicle(params.id);

  if (!vehicle) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold text-gray-500">Kendaraan tidak ditemukan</h1>
      </div>
    );
  }

  return <VehicleDetails vehicle={vehicle} />;
}

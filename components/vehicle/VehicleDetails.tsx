'use client';

import React from 'react';
import { generateWALink } from '@/lib/whatsapp';

// Define types based on Prisma schema (partial)
interface VehicleDetailsProps {
  vehicle: {
    id: number;
    title: string;
    brand: string;
    model: string;
    year: number;
    transmission: string;
    fuel_type?: string | null;
    engine_size?: number | null;
    mileage: number;
    color?: string | null;
    price: string | number; // Decimal comes as string from JSON often
    description?: string | null;
    location_province: string;
    location_city: string;
    created_at: string;
    user: {
      name: string;
      phone_number: string;
      created_at: string;
    };
    images: {
      id: number;
      image_url: string;
      is_primary: boolean;
    }[];
  };
}

const VehicleDetails: React.FC<VehicleDetailsProps> = ({ vehicle }) => {
  const priceNumber = typeof vehicle.price === 'string' ? parseFloat(vehicle.price) : vehicle.price;

  const formattedPrice = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(priceNumber);

  const waLink = generateWALink(vehicle.user.phone_number, vehicle.title, priceNumber);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Images */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-gray-200 rounded-lg overflow-hidden h-96 w-full">
             {/* Primary Image */}
             {vehicle.images.length > 0 ? (
               <img
                 src={vehicle.images.find(img => img.is_primary)?.image_url || vehicle.images[0].image_url}
                 alt={vehicle.title}
                 className="w-full h-full object-contain bg-black"
               />
             ) : (
               <div className="flex items-center justify-center h-full text-gray-500">No Image Available</div>
             )}
          </div>

          {/* Thumbnails */}
          {vehicle.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {vehicle.images.map((img) => (
                <div key={img.id} className="w-24 h-24 flex-shrink-0 cursor-pointer border rounded-md overflow-hidden">
                  <img src={img.image_url} alt="Thumbnail" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}

          {/* Description */}
          <div className="bg-white p-6 rounded-lg shadow-sm border mt-6">
            <h2 className="text-xl font-bold mb-4">Deskripsi</h2>
            <div className="prose max-w-none text-gray-700 whitespace-pre-line">
              {vehicle.description || 'Tidak ada deskripsi.'}
            </div>
          </div>
        </div>

        {/* Right Column: Info & Action */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-md border sticky top-4">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{vehicle.title}</h1>
            <p className="text-3xl font-bold text-blue-700 mb-4">{formattedPrice}</p>

            <div className="text-gray-600 mb-6 flex items-center">
              <span className="mr-2">📍</span>
              {vehicle.location_city}, {vehicle.location_province}
            </div>

            <div className="border-t border-b py-4 my-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500">Tahun</span>
                <span className="font-medium">{vehicle.year}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Kilometer</span>
                <span className="font-medium">{vehicle.mileage.toLocaleString()} km</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Transmisi</span>
                <span className="font-medium">{vehicle.transmission}</span>
              </div>
              {vehicle.engine_size && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Mesin</span>
                  <span className="font-medium">{vehicle.engine_size} cc</span>
                </div>
              )}
            </div>

            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <h3 className="font-bold text-gray-800 mb-2">Penjual</h3>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center text-gray-600 font-bold">
                  {vehicle.user.name.charAt(0)}
                </div>
                <div>
                  <p className="font-medium">{vehicle.user.name}</p>
                  <p className="text-xs text-gray-500">Member sejak {new Date(vehicle.user.created_at).getFullYear()}</p>
                </div>
              </div>
            </div>

            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full bg-green-500 hover:bg-green-600 text-white text-center font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <span>Hubungi Penjual via WhatsApp</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VehicleDetails;

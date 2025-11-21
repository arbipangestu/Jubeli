import React from 'react';

// Define interface for VehicleCard props
interface VehicleCardProps {
  id: number;
  image: string;
  title: string;
  price: number;
  year: number;
  transmission: string;
  location: string;
}

const VehicleCard: React.FC<VehicleCardProps> = ({
  id,
  image,
  title,
  price,
  year,
  transmission,
  location
}) => {
  // Format price
  const formattedPrice = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price);

  return (
    <div className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow bg-white">
      <div className="relative h-48 w-full bg-gray-200">
        {image ? (
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            No Image
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-bold text-lg mb-1 truncate">{title}</h3>
        <p className="text-xl font-bold text-blue-600 mb-2">{formattedPrice}</p>

        <div className="flex gap-2 mb-3">
          <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">
            {year}
          </span>
          <span className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">
            {transmission}
          </span>
        </div>

        <div className="flex items-center text-gray-500 text-sm mt-auto">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {location}
        </div>
      </div>
    </div>
  );
};

export default VehicleCard;

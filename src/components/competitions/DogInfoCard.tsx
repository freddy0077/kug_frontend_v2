import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { DogInfo } from '@/types/competition';

interface DogInfoCardProps {
  dogInfo: DogInfo;
}

const DogInfoCard: React.FC<DogInfoCardProps> = ({ dogInfo }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Dog image */}
        <div className="w-full md:w-1/3 relative h-64 rounded-lg overflow-hidden">
          {dogInfo.imageUrl ? (
            <Image 
              src={dogInfo.imageUrl}
              alt={dogInfo.name}
              className="object-cover"
              fill
            />
          ) : (
            <div className="h-full w-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-400">No image available</span>
            </div>
          )}
        </div>
        
        {/* Dog details */}
        <div className="w-full md:w-2/3">
          <h2 className="text-xl font-semibold mb-4">Dog Information</h2>
          <ul className="space-y-3">
            <li className="flex justify-between items-center border-b border-gray-100 pb-2">
              <span className="text-gray-600">Name:</span>
              <span className="font-medium">
                <Link 
                  href={`/manage/dogs/${dogInfo.id}`}
                  className="text-blue-600 hover:text-blue-800"
                >
                  {dogInfo.name}
                </Link>
              </span>
            </li>
            <li className="flex justify-between items-center border-b border-gray-100 pb-2">
              <span className="text-gray-600">Breed:</span>
              <span className="font-medium">{dogInfo.breed}</span>
            </li>
            <li className="flex justify-between items-center border-b border-gray-100 pb-2">
              <span className="text-gray-600">Registration:</span>
              <span className="font-medium">{dogInfo.registrationNumber}</span>
            </li>
            <li className="flex justify-between items-center border-b border-gray-100 pb-2">
              <span className="text-gray-600">Owner:</span>
              <span className="font-medium">{dogInfo.ownerName}</span>
            </li>
            {dogInfo.handlerName && (
              <li className="flex justify-between items-center border-b border-gray-100 pb-2">
                <span className="text-gray-600">Handler:</span>
                <span className="font-medium">{dogInfo.handlerName}</span>
              </li>
            )}
          </ul>
          
          <div className="mt-4">
            <Link 
              href={`/pedigrees/${dogInfo.id}`}
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              View Pedigree →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DogInfoCard;

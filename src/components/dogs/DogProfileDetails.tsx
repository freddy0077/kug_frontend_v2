'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import Link from 'next/link';
import { hasPermission, UserRole } from '@/utils/permissionUtils';

type DogDetailsProps = {
  dog: {
    id: string;
    name: string;
    breedName: string;
    breedObj?: {
      id?: string;
      name: string;
      group?: string;
      origin?: string;
    };
    gender: 'male' | 'female';
    color: string;
    dateOfBirth: Date;
    dateOfDeath?: Date;
    registrationNumber?: string;
    microchipNumber?: string;
    ownerId: string;
    ownerName?: string;
    breeder?: string;
    titles?: string[];
    awards?: string[];
    height?: number;
    weight?: number;
    notes?: string;
  };
  userRole: UserRole;
  userId: string;
};

export default function DogProfileDetails({
  dog,
  userRole,
  userId
}: DogDetailsProps) {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    physical: true,
    registration: true,
    titles: false,
    notes: false
  });

  const canEdit = hasPermission(userRole, 'dog', 'edit', dog.ownerId, userId);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg divide-y divide-gray-200">
      {/* Physical Characteristics Section */}
      <div className="px-4 py-5 sm:px-6">
        <div 
          className="flex items-center justify-between cursor-pointer"
          onClick={() => toggleSection('physical')}
        >
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Physical Characteristics
          </h3>
          <span>
            {expandedSections.physical ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            )}
          </span>
        </div>
        
        {expandedSections.physical && (
          <dl className="mt-4 grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Breed</dt>
              <dd className="mt-1 text-sm text-gray-900">{dog.breedObj?.name || dog.breedName}</dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Color</dt>
              <dd className="mt-1 text-sm text-gray-900">{dog.color}</dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Gender</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {dog.gender === 'male' ? 'Male' : 'Female'}
                {dog.gender === 'male' 
                  ? <span className="ml-2 text-blue-500">♂</span> 
                  : <span className="ml-2 text-pink-500">♀</span>}
              </dd>
            </div>
            {dog.height && (
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Height</dt>
                <dd className="mt-1 text-sm text-gray-900">{dog.height} cm</dd>
              </div>
            )}
            {dog.weight && (
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Weight</dt>
                <dd className="mt-1 text-sm text-gray-900">{dog.weight} kg</dd>
              </div>
            )}
          </dl>
        )}
      </div>

      {/* Registration Details Section */}
      <div className="px-4 py-5 sm:px-6">
        <div 
          className="flex items-center justify-between cursor-pointer"
          onClick={() => toggleSection('registration')}
        >
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Registration Details
          </h3>
          <span>
            {expandedSections.registration ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            )}
          </span>
        </div>

        {expandedSections.registration && (
          <dl className="mt-4 grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Registration Number</dt>
              <dd className="mt-1 text-sm text-gray-900">{dog.registrationNumber || 'Not registered'}</dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Microchip Number</dt>
              <dd className="mt-1 text-sm text-gray-900">{dog.microchipNumber || 'Not microchipped'}</dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Owner</dt>
              <dd className="mt-1 text-sm text-gray-900">{dog.ownerName || 'Not specified'}</dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Breeder</dt>
              <dd className="mt-1 text-sm text-gray-900">{dog.breeder || 'Not specified'}</dd>
            </div>
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Date of Birth</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {format(new Date(dog.dateOfBirth), 'MMMM d, yyyy')}
              </dd>
            </div>
            {dog.dateOfDeath && (
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Date of Death</dt>
                <dd className="mt-1 text-sm text-gray-900 text-red-500">
                  {format(new Date(dog.dateOfDeath), 'MMMM d, yyyy')}
                </dd>
              </div>
            )}
          </dl>
        )}
      </div>

      {/* Titles and Awards Section */}
      <div className="px-4 py-5 sm:px-6">
        <div 
          className="flex items-center justify-between cursor-pointer"
          onClick={() => toggleSection('titles')}
        >
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Titles and Awards
          </h3>
          <span>
            {expandedSections.titles ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            )}
          </span>
        </div>

        {expandedSections.titles && (
          <div className="mt-4">
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-500">Titles</h4>
              {dog.titles && dog.titles.length > 0 ? (
                <div className="mt-2 flex flex-wrap gap-2">
                  {dog.titles.map((title, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800"
                    >
                      {title}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="mt-2 text-sm text-gray-500">No titles earned yet</p>
              )}
            </div>
            
            <div>
              <h4 className="text-sm font-medium text-gray-500">Awards</h4>
              {dog.awards && dog.awards.length > 0 ? (
                <div className="mt-2 flex flex-wrap gap-2">
                  {dog.awards.map((award, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-purple-100 text-purple-800"
                    >
                      {award}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="mt-2 text-sm text-gray-500">No awards earned yet</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Notes Section */}
      {dog.notes && (
        <div className="px-4 py-5 sm:px-6">
          <div 
            className="flex items-center justify-between cursor-pointer"
            onClick={() => toggleSection('notes')}
          >
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Notes
            </h3>
            <span>
              {expandedSections.notes ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              )}
            </span>
          </div>

          {expandedSections.notes && (
            <div className="mt-4">
              <p className="text-sm text-gray-900 whitespace-pre-line">{dog.notes}</p>
            </div>
          )}
        </div>
      )}

      {/* Edit Button */}
      {canEdit && (
        <div className="px-4 py-4 sm:px-6 bg-gray-50">
          <Link
            href={`/manage/dogs/${dog.id}/edit`}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg className="-ml-1 mr-2 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
            Edit Details
          </Link>
        </div>
      )}
    </div>
  );
}

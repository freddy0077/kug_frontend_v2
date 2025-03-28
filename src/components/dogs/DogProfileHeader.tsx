'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { format } from 'date-fns';
import { hasPermission, UserRole } from '@/utils/permissionUtils';
import ApprovalStatusBadge from '../common/ApprovalStatusBadge';
import { ApprovalStatus } from '@/types/enums';

type DogProfileHeaderProps = {
  dog: {
    id: string;
    name: string;
    breedName: string;
    gender: 'male' | 'female';
    color: string;
    dateOfBirth: Date;
    dateOfDeath?: Date;
    registrationNumber?: string;
    microchipNumber?: string;
    ownerId: string;
    ownerName?: string;
    profileImageUrl?: string;
    approvalStatus?: ApprovalStatus;
    approvalDate?: string;
    approvalNotes?: string;
    approvedBy?: {
      id: string;
      fullName: string;
    };
  };
  userRole: UserRole;
  userId: string;
};

export default function DogProfileHeader({
  dog,
  userRole,
  userId
}: DogProfileHeaderProps) {
  const [age, setAge] = useState<string>('');
  const [canEdit, setCanEdit] = useState(false);

  useEffect(() => {
    // Calculate age
    calculateAge();
    
    // Check permissions
    const hasEditPermission = hasPermission(userRole, 'dog', 'edit', dog.ownerId, userId);
    setCanEdit(hasEditPermission);
  }, [dog, userRole, userId]);

  const calculateAge = () => {
    // Ensure dateOfBirth is a Date object
    const birthDate = dog.dateOfBirth instanceof Date 
      ? dog.dateOfBirth 
      : new Date(dog.dateOfBirth);
      
    if (isNaN(birthDate.getTime())) {
      setAge('Unknown');
      return;
    }
    
    // If dog is deceased, calculate age at death
    if (dog.dateOfDeath) {
      const deathDate = dog.dateOfDeath instanceof Date 
        ? dog.dateOfDeath 
        : new Date(dog.dateOfDeath);
        
      if (!isNaN(deathDate.getTime())) {
        const ageInYears = (deathDate.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
        setAge(`${Math.floor(ageInYears)} years at time of death`);
        return;
      }
    }
    
    // Calculate current age
    const today = new Date();
    const ageInYears = (today.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25);
    
    if (ageInYears < 1) {
      const ageInMonths = Math.floor(ageInYears * 12);
      setAge(`${ageInMonths} months`);
    } else {
      setAge(`${Math.floor(ageInYears)} years`);
    }
  };

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6 flex items-center justify-between flex-wrap">
        <div className="flex items-center">
          {dog.profileImageUrl ? (
            <Image
              src={dog.profileImageUrl}
              alt={dog.name}
              width={96}
              height={96}
              className="h-24 w-24 rounded-full object-cover mr-4"
            />
          ) : (
            <div className="h-24 w-24 rounded-full bg-gray-200 flex items-center justify-center mr-4">
              <svg className="h-12 w-12 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18.885 3.515c-1.01-1.01-2.378-1.576-3.804-1.576s-2.794.566-3.804 1.576c-1.01 1.01-1.576 2.378-1.576 3.804s.566 2.794 1.576 3.804c1.01 1.01 2.378 1.576 3.804 1.576s2.794-.566 3.804-1.576c1.01-1.01 1.576-2.378 1.576-3.804s-.566-2.794-1.576-3.804zM12 5.85c0-1.98 1.619-3.6 3.6-3.6s3.6 1.62 3.6 3.6c0 1.982-1.619 3.6-3.6 3.6s-3.6-1.618-3.6-3.6zM20.4 14.4c-1.198-.798-3.436-1.8-5.4-1.8-1.964 0-4.203 1.002-5.4 1.8-2.414 1.61-3.6 5.4-3.6 5.4v1.8h18v-1.8s-1.186-3.79-3.6-5.4z" />
              </svg>
            </div>
          )}
          
          <div>
            <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
              {dog.name}
              {dog.gender === 'male' 
                ? <span className="ml-2 text-blue-500">♂</span> 
                : <span className="ml-2 text-pink-500">♀</span>}
            </h1>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              {dog.breedName} • {dog.color} • {age}
              {dog.dateOfDeath && (
                <span className="text-red-500 ml-2">(Deceased)</span>
              )}
            </p>
            
            {/* Approval Status */}
            {dog.approvalStatus && (
              <div className="mt-2 flex items-center">
                <span className="text-sm text-gray-500 mr-2">Status:</span>
                <ApprovalStatusBadge 
                  status={dog.approvalStatus}
                  approvalDate={dog.approvalDate}
                  approvedBy={dog.approvedBy}
                  notes={dog.approvalNotes}
                />
              </div>
            )}
          </div>
        </div>
        
        {canEdit && (
          <div className="flex mt-4 sm:mt-0">
            <Link
              href={`/manage/dogs/${dog.id}/profile`}
              className="ml-3 inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Edit Dog
            </Link>
            <Link
              href={`/manage/dogs/${dog.id}/photos`}
              className="ml-3 inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Manage Photos
            </Link>
          </div>
        )}
      </div>
      
      <div className="border-t border-gray-200">
        <dl>
          <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">
              Date of Birth
            </dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              {format(new Date(dog.dateOfBirth), 'MMMM d, yyyy')}
            </dd>
          </div>
          
          {dog.dateOfDeath && (
            <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">
                Date of Death
              </dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {format(new Date(dog.dateOfDeath), 'MMMM d, yyyy')}
              </dd>
            </div>
          )}
          
          <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">
              Owner
            </dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              {dog.ownerName || 'Not specified'}
            </dd>
          </div>
          
          <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">
              Registration Number
            </dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              {dog.registrationNumber || 'Not registered'}
            </dd>
          </div>
          
          <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">
              Microchip Number
            </dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
              {dog.microchipNumber || 'Not microchipped'}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}

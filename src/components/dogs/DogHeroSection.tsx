'use client';

import { format } from 'date-fns';
import Link from 'next/link';
import { ApprovalStatus, UserRole } from '@/types/enums';
import ApprovalStatusBadge from '@/components/common/ApprovalStatusBadge';
import { useAuth } from '@/contexts/AuthContext';

interface DogHeroSectionProps {
  dog: {
    id: string;
    name: string;
    breed: string;
    breedObj?: {
      name: string;
      group?: string;
    };
    gender: string;
    approvalStatus?: ApprovalStatus;
    mainImageUrl?: string;
    color?: string;
    registrationNumber?: string;
    titles?: string[];
    dateOfBirth: string;
  };
}

const DogHeroSection: React.FC<DogHeroSectionProps> = ({ dog }) => {
  const { user } = useAuth();
  const isAdmin = user?.role === UserRole.ADMIN;
  
  // Calculate age
  const calculateAge = (dateOfBirth: string): string => {
    try {
      const birth = new Date(dateOfBirth);
      const now = new Date();
      const ageInYears = now.getFullYear() - birth.getFullYear();
      const monthDiff = now.getMonth() - birth.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.getDate())) {
        return `${ageInYears - 1} year${ageInYears !== 2 ? 's' : ''}`;
      }
      
      return `${ageInYears} year${ageInYears !== 1 ? 's' : ''}`;
    } catch (e) {
      console.error("Error calculating age:", e);
      return "Age unknown";
    }
  };

  return (
    <div className="relative">
      {/* Background image with gradient overlay */}
      <div className="h-72 md:h-96 relative overflow-hidden">
        {dog.mainImageUrl ? (
          <>
            <img 
              src={dog.mainImageUrl} 
              alt={dog.name} 
              className="absolute inset-0 w-full h-full object-cover"
            />
            {/* Gradient overlay for better text readability */}
            <div 
              className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-60"
              aria-hidden="true"
            />
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-t from-green-900 to-green-700">
            <div className="flex items-center justify-center h-full">
              <svg className="w-32 h-32 text-green-100 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
          </div>
        )}

        {/* Content container positioned over the image */}
        <div className="absolute inset-0 flex flex-col justify-end">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-6 md:pb-10">
            {/* Admin actions - floating position */}
            {isAdmin && (
              <div className="absolute top-4 right-4 z-20">
                <Link
                  href={`/manage/dogs/${dog.id}/edit`}
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit Dog
                </Link>
              </div>
            )}

            {/* Dog badges */}
            <div className="flex flex-wrap items-center gap-2 mb-3">
              {/* Gender badge */}
              <span className={`px-2.5 py-1 text-xs font-bold rounded-full capitalize ${
                dog.gender.toLowerCase() === 'male' 
                  ? 'bg-blue-100 text-blue-800' 
                  : 'bg-pink-100 text-pink-800'
              }`}>
                {dog.gender}
              </span>
              
              {/* Color badge if available */}
              {dog.color && (
                <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-gray-100 text-gray-800">
                  {dog.color}
                </span>
              )}
              
              {/* Registration badge if available */}
              {dog.registrationNumber && (
                <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-indigo-100 text-indigo-800">
                  Reg: {dog.registrationNumber}
                </span>
              )}
              
              {/* Approval status if applicable */}
              {dog.approvalStatus && (
                <ApprovalStatusBadge status={dog.approvalStatus} showTooltip={true} />
              )}
            </div>
            
            {/* Dog name and breed */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white tracking-tight">
              {dog.name}
            </h1>
            
            <div className="flex flex-wrap items-baseline gap-x-2 mt-1">
              <h2 className="text-xl md:text-2xl font-medium text-white/90">
                {dog.breedObj?.name || dog.breed}
              </h2>
              
              {dog.breedObj?.group && (
                <span className="text-sm md:text-base text-white/80">
                  ({dog.breedObj.group} Group)
                </span>
              )}
              
              <span className="text-sm md:text-base text-white/70 ml-2">
                {calculateAge(dog.dateOfBirth)}
              </span>
            </div>
            
            {/* Titles */}
            {dog.titles && dog.titles.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-4">
                {dog.titles.map((title, index) => (
                  <span key={index} className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-1 rounded-md shadow-sm">
                    {title}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Back navigation button */}
      <div className="absolute top-4 left-4 z-10">
        <Link 
          href="/dogs"
          className="inline-flex items-center px-3 py-1.5 bg-white/90 hover:bg-white rounded-md shadow-md text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-150"
        >
          <svg className="-ml-0.5 mr-1.5 h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          Back
        </Link>
      </div>
    </div>
  );
};

export default DogHeroSection;

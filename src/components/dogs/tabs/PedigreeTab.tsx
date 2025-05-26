'use client';

import Link from 'next/link';

interface DogRelative {
  id: string;
  name: string;
  registrationNumber?: string;
  mainImageUrl?: string;
}

interface PedigreeTabProps {
  dogId: string;
  dogName: string;
  sire?: DogRelative | null;
  dam?: DogRelative | null;
}

const PedigreeTab: React.FC<PedigreeTabProps> = ({
  dogId,
  dogName,
  sire,
  dam
}) => {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Pedigree Preview
          </h3>
          
          <Link
            href={`/pedigrees?dogId=${dogId}`}
            className="inline-flex items-center px-3 py-1.5 text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            View Full Pedigree
          </Link>
        </div>
        
        {/* Simple pedigree preview */}
        <div className="flex flex-col items-center">
          {/* First generation (subject dog) */}
          <div className="w-full max-w-xs bg-green-100 rounded-lg p-4 border border-green-200 mb-6 text-center">
            <div className="font-bold text-lg">{dogName}</div>
            <div className="text-sm text-gray-600">Subject</div>
          </div>
          
          {/* Connect lines */}
          <div className="w-px h-8 bg-gray-300"></div>
          
          {/* Second generation (parents) */}
          <div className="grid grid-cols-2 gap-8 w-full max-w-lg">
            <div className="flex flex-col items-center">
              <div className="w-px h-8 bg-gray-300"></div>
              <div className={`w-full bg-blue-50 rounded-lg p-4 border ${sire ? 'border-blue-200' : 'border-gray-200 opacity-60'}`}>
                {sire ? (
                  <div className="space-y-1">
                    <div className="font-bold">{sire.name}</div>
                    <div className="text-sm text-gray-600">Sire (Father)</div>
                    {sire.registrationNumber && (
                      <div className="text-xs text-gray-500">Reg: {sire.registrationNumber}</div>
                    )}
                    <Link 
                      href={`/dogs/${sire.id}`} 
                      className="text-xs text-blue-600 hover:text-blue-800 inline-flex items-center mt-1"
                    >
                      View Profile
                      <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                ) : (
                  <div className="text-center py-2">
                    <div className="font-medium text-gray-400">Unknown Sire</div>
                    <div className="text-sm text-gray-400">No data available</div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="w-px h-8 bg-gray-300"></div>
              <div className={`w-full bg-pink-50 rounded-lg p-4 border ${dam ? 'border-pink-200' : 'border-gray-200 opacity-60'}`}>
                {dam ? (
                  <div className="space-y-1">
                    <div className="font-bold">{dam.name}</div>
                    <div className="text-sm text-gray-600">Dam (Mother)</div>
                    {dam.registrationNumber && (
                      <div className="text-xs text-gray-500">Reg: {dam.registrationNumber}</div>
                    )}
                    <Link 
                      href={`/dogs/${dam.id}`} 
                      className="text-xs text-pink-600 hover:text-pink-800 inline-flex items-center mt-1"
                    >
                      View Profile
                      <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                ) : (
                  <div className="text-center py-2">
                    <div className="font-medium text-gray-400">Unknown Dam</div>
                    <div className="text-sm text-gray-400">No data available</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Call to action for full pedigree */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600 mb-3">
            Explore the complete family tree with multiple generations
          </p>
          <Link
            href={`/pedigrees?dogId=${dogId}`}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Analyze Full Lineage
          </Link>
        </div>
      </div>
      
      {/* Tools section */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Pedigree Tools
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            href={`/tools/inbreeding-calculator?dogId=${dogId}`}
            className="flex flex-col items-center p-4 border rounded-lg bg-indigo-50 hover:bg-indigo-100 transition-colors"
          >
            <svg className="w-10 h-10 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            <div className="font-semibold mt-2">Inbreeding Calculator</div>
            <p className="text-sm text-center text-gray-600 mt-1">
              Calculate inbreeding coefficient
            </p>
          </Link>
          
          <Link
            href={`/tools/genetic-calculator?dogId=${dogId}`}
            className="flex flex-col items-center p-4 border rounded-lg bg-purple-50 hover:bg-purple-100 transition-colors"
          >
            <svg className="w-10 h-10 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
            <div className="font-semibold mt-2">Genetic Predictor</div>
            <p className="text-sm text-center text-gray-600 mt-1">
              Predict traits for offspring
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PedigreeTab;

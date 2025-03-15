'use client';

import Image from "next/image";
import Link from "next/link";
import { format } from "date-fns";
import { useQuery } from "@apollo/client";
import { GET_DOGS, DogSortField, SortDirection } from "@/graphql/queries/dogQueries";
import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";

// Define types for dog data
interface Owner {
  id: string;
  name: string;
  contactEmail?: string;
  contactPhone?: string;
}

interface Dog {
  id: string;
  name: string;
  breed: string;
  breedObj?: {
    id?: string;
    name: string;
    group?: string;
    origin?: string;
  };
  gender?: string;
  dateOfBirth: string;
  dateOfDeath?: string;
  registrationNumber?: string;
  microchipNumber?: string;
  mainImageUrl?: string;
  currentOwner?: Owner;
}

export default function Home() {
  const [featuredDogs, setFeaturedDogs] = useState<Dog[]>([]);
  
  // Fetch featured dogs using GraphQL
  const { loading, error, data } = useQuery(GET_DOGS, {
    variables: {
      limit: 3,
      sortBy: DogSortField.DATE_OF_BIRTH,
      sortDirection: SortDirection.DESC,
    },
  });

  useEffect(() => {
    if (data && data.dogs && data.dogs.items) {
      setFeaturedDogs(data.dogs.items);
    }
  }, [data]);

  // Format date properly - ensuring safe handling of date values
  const formatDogDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return format(date, 'MMMM d, yyyy');
    } catch (error) {
      console.error("Invalid date format:", error);
      return "N/A";
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-gray-900 to-green-900 text-white py-20">
        <div className="max-w-7xl mx-auto px-6 flex flex-col lg:flex-row items-center">
          <div className="lg:w-1/2 mb-10 lg:mb-0">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Professional Dog Pedigree Management</h1>
            <p className="text-xl mb-8">Track lineage, health records, and competition achievements for purebred dogs with our comprehensive platform.</p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link 
                href="/auth/register" 
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition duration-300 text-center">
                Register Now
              </Link>
              <Link 
                href="/dogs" 
                className="bg-white text-gray-900 hover:bg-gray-100 font-bold py-3 px-6 rounded-lg transition duration-300 text-center">
                Browse Dogs
              </Link>
            </div>
          </div>
          <div className="lg:w-1/2 flex justify-center">
            <div className="relative w-full max-w-md h-80 bg-gray-800 rounded-lg overflow-hidden">
              {/* Placeholder for hero image */}
              <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                <span className="text-lg">Dog Pedigree Management</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Dogs */}
      <section className="py-16 bg-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">Featured Dogs</h2>
            <Link href="/dogs" className="text-green-600 hover:text-green-800 font-semibold">View All Dogs →</Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {loading ? (
              // Show skeleton loading state
              Array(3).fill(0).map((_, index) => (
                <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <Skeleton className="h-48 w-full" />
                  <div className="p-6">
                    <Skeleton className="h-8 w-3/4 mb-4" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-full mb-4" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                </div>
              ))
            ) : error ? (
              <div className="col-span-3 py-10 text-center">
                <p className="text-red-500">Error loading featured dogs. Please try again later.</p>
              </div>
            ) : featuredDogs.length > 0 ? (
              featuredDogs.map((dog: Dog) => (
                <div key={dog.id} className="bg-white rounded-lg shadow-md overflow-hidden transition transform hover:-translate-y-1 hover:shadow-xl">
                  <div className="h-48 bg-gray-300 relative">
                    {dog.mainImageUrl ? (
                      <Image 
                        src={dog.mainImageUrl} 
                        alt={dog.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                        <span>No Image Available</span>
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-bold mb-2">{dog.name}</h3>
                    <div className="flex flex-col text-gray-600 mb-4 space-y-1">
                      <div className="flex items-center">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>Born: {formatDogDate(dog.dateOfBirth)}</span>
                      </div>
                      {dog.currentOwner && (
                        <div className="flex items-center">
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          <span>Owner: {dog.currentOwner.name}</span>
                        </div>
                      )}
                      <div className="flex items-center">
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                        <span>Breed: {dog.breedObj?.name || dog.breed}</span>
                      </div>
                    </div>
                    <Link 
                      href={`/dogs/${dog.id}`} 
                      className="block w-full bg-green-600 hover:bg-green-700 text-white text-center py-2 rounded transition">
                      View Details
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-3 py-10 text-center">
                <p>No featured dogs available at this time.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">Pedigree Database Features</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 rounded-lg">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">1</div>
              <h3 className="text-xl font-bold mb-3">Comprehensive Pedigree Tracking</h3>
              <p className="text-gray-600">Maintain detailed lineage records with multi-generational pedigree charts and inbreeding coefficient calculations.</p>
            </div>
            
            <div className="text-center p-6 rounded-lg">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">2</div>
              <h3 className="text-xl font-bold mb-3">Health Record Management</h3>
              <p className="text-gray-600">Track vaccinations, medical conditions, and genetic test results to ensure the health of your breeding program.</p>
            </div>
            
            <div className="text-center p-6 rounded-lg">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">3</div>
              <h3 className="text-xl font-bold mb-3">Competition Results</h3>
              <p className="text-gray-600">Document show championships, field trials, and other achievements to showcase your dogs' accomplishments.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gray-900 text-white py-16">
        <div className="max-w-4xl mx-auto text-center px-6">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Manage Your Dog Breeding Program?</h2>
          <p className="text-xl mb-8">Join professional breeders and kennel clubs who trust our platform for maintaining accurate pedigree records.</p>
          <Link 
            href="/auth/register" 
            className="inline-block bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg text-lg transition duration-300">
            Get Started Today
          </Link>
        </div>
      </section>
    </div>
  );
}

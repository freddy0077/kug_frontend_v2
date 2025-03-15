'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';

// Import our component modules
import CompetitionHeader from '@/components/competitions/CompetitionHeader';
import CompetitionDetails from '@/components/competitions/CompetitionDetails';
import DogInfoCard from '@/components/competitions/DogInfoCard';
import CompetitionActions from '@/components/competitions/CompetitionActions';
import RelatedCompetitions from '@/components/competitions/RelatedCompetitions';

// Import data services
import { getCompetitionById, getDogById, getRelatedCompetitions } from '@/services/competitionDataService';

// Import types
import { CompetitionResult, DogInfo } from '@/types/competition';

export default function CompetitionDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const competitionId = params?.id;
  
  const [competition, setCompetition] = useState<CompetitionResult | null>(null);
  const [dogInfo, setDogInfo] = useState<DogInfo | null>(null);
  const [relatedCompetitions, setRelatedCompetitions] = useState<CompetitionResult[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check authentication status from localStorage
    const authStatus = localStorage.getItem('isAuthenticated') === 'true';
    const role = localStorage.getItem('userRole') || '';
    
    setIsAuthenticated(authStatus);
    setUserRole(role);
    
    // Redirect to login if not authenticated
    if (!authStatus) {
      router.push('/auth/login');
      return;
    }
    
    // Check if user has permission to view competition results
    const hasPermission = role === 'admin' || 
                          role === 'owner' || 
                          role === 'handler' || 
                          role === 'club';
                          
    if (authStatus && !hasPermission) {
      // Redirect to dashboard if authenticated but doesn't have permission
      router.push('/manage');
      return;
    }

    // Fetch competition details
    fetchCompetitionDetails();
  }, [router, competitionId]);

  // Function to fetch competition details
  const fetchCompetitionDetails = async () => {
    try {
      setIsLoading(true);
      
      // In a real application, this would be an API call
      // For demo purposes, we'll use mock data
      
      // Mock data for competition details
      const mockCompetitionData: CompetitionResult = {
        id: 1,
        dogId: 1,
        dogName: "Max",
        eventName: "National Kennel Club Championship",
        eventDate: new Date(2024, 9, 15),
        location: "Denver, CO",
        rank: 1,
        title_earned: "Best in Show",
        judge: "Elizabeth Johnson",
        points: 25,
        category: "conformation",
        description: "This prestigious annual event showcases the finest purebred dogs from across the country. Dogs are judged based on how closely they conform to their breed's official standard.",
        totalParticipants: 120,
        imageUrl: "https://images.unsplash.com/photo-1558929996-da64ba858215?q=80&w=1000"
      };
      
      // Mock data for dog information
      const mockDogData: DogInfo = {
        id: 1,
        name: "Max",
        breed: "German Shepherd",
        registrationNumber: "AKC123456",
        ownerName: "John Smith",
        handlerName: "Sarah Johnson",
        imageUrl: "https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?q=80&w=1000"
      };
      
      // Simulate API delay
      setTimeout(() => {
        // Check if competitionId matches our mock data
        if (Number(competitionId) === mockCompetitionData.id) {
          setCompetition(mockCompetitionData);
          setDogInfo(mockDogData);
        } else {
          setError("Competition not found");
          toast.error("Competition not found");
        }
        setIsLoading(false);
      }, 800);
      
    } catch (err) {
      console.error("Error fetching competition details:", err);
      setError("Failed to fetch competition details");
      toast.error("Failed to fetch competition details");
      setIsLoading(false);
    }
  };



  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !competition) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen px-4">
        <h1 className="text-2xl font-bold text-red-600 mb-4">
          {error || "Competition not found"}
        </h1>
        <p className="text-gray-600 mb-8">
          The competition you are looking for could not be found or you don't have permission to view it.
        </p>
        <Link 
          href="/competitions"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Return to Competitions
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Loading indicator */}
      {isLoading ? (
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error || !competition ? (
        <div className="flex flex-col items-center justify-center min-h-screen px-4">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            {error || "Competition not found"}
          </h1>
          <p className="text-gray-600 mb-8">
            The competition you are looking for could not be found or you don't have permission to view it.
          </p>
          <Link 
            href="/competitions"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Return to Competitions
          </Link>
        </div>
      ) : (
        <>
          {/* Header component */}
          <CompetitionHeader competition={competition} />
          
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {/* Competition details component */}
            <CompetitionDetails competition={competition} />
          </div>
          
          {/* Dog information component */}
          {dogInfo && <DogInfoCard dogInfo={dogInfo} />}
          
          {/* Related competitions component */}
          {relatedCompetitions.length > 0 && (
            <RelatedCompetitions competitions={relatedCompetitions} />
          )}
          
          {/* Actions component */}
          <CompetitionActions competitionId={competition.id} userRole={userRole} />
        </>
      )}
    </div>
  );
}

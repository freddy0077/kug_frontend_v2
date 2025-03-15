import { CompetitionResult, DogInfo } from '@/types/competition';

// Mock data for competition details with correct field naming (using title_earned not certificate)
const mockCompetition: CompetitionResult = {
  id: 1,
  dogId: 1,
  dogName: "Max",
  eventName: "National Kennel Club Championship",
  eventDate: new Date(2025, 2, 15), // Ensuring dates are properly instantiated as Date objects
  location: "Denver, CO",
  rank: 1,
  title_earned: "Best in Show", // Using title_earned as per memory
  judge: "Elizabeth Johnson",
  points: 25,
  category: "conformation",
  description: "This prestigious annual event showcases the finest purebred dogs from across the country. Dogs are judged based on how closely they conform to their breed's official standard.",
  totalParticipants: 120,
  imageUrl: "https://images.unsplash.com/photo-1558929996-da64ba858215?q=80&w=1000"
};

// Mock data for related competitions
const mockRelatedCompetitions: CompetitionResult[] = [
  {
    id: 2,
    dogId: 1,
    dogName: "Max",
    eventName: "Regional Kennel Club Show",
    eventDate: new Date(2025, 1, 20),
    location: "Boulder, CO",
    rank: 2,
    title_earned: "Excellence in Breed",
    judge: "Robert Wilson",
    points: 15,
    category: "conformation",
    totalParticipants: 85,
    imageUrl: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?q=80&w=1000"
  },
  {
    id: 3,
    dogId: 1,
    dogName: "Max",
    eventName: "Agility Championship",
    eventDate: new Date(2024, 11, 10),
    location: "Colorado Springs, CO",
    rank: 1,
    title_earned: "Agility Master",
    judge: "Patricia Davis",
    points: 22,
    category: "agility",
    totalParticipants: 65,
    imageUrl: "https://images.unsplash.com/photo-1553882809-a4f57e59501d?q=80&w=1000"
  },
  {
    id: 4,
    dogId: 1,
    dogName: "Max",
    eventName: "Obedience Trial",
    eventDate: new Date(2024, 10, 5),
    location: "Fort Collins, CO",
    rank: 3,
    title_earned: "Companion Dog Excellent",
    judge: "Michael Brown",
    points: 18,
    category: "obedience",
    totalParticipants: 40,
    imageUrl: "https://images.unsplash.com/photo-1560743641-3914f2c45636?q=80&w=1000"
  }
];

// Mock data for dog information
const mockDog: DogInfo = {
  id: 1,
  name: "Max",
  breed: "German Shepherd",
  registrationNumber: "AKC123456",
  ownerName: "John Smith",
  handlerName: "Sarah Johnson",
  imageUrl: "https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?q=80&w=1000"
};

export const getCompetitionById = async (id: string | number): Promise<CompetitionResult | null> => {
  try {
    // In a real application, this would be an API call
    // For demo purposes, we're using mock data and simulating a network delay
    return new Promise((resolve) => {
      setTimeout(() => {
        // Check if the requested ID matches our mock data
        if (Number(id) === mockCompetition.id) {
          // Always ensure eventDate is a proper Date object
          resolve({
            ...mockCompetition,
            eventDate: mockCompetition.eventDate instanceof Date ? 
                      mockCompetition.eventDate : 
                      new Date(mockCompetition.eventDate)
          });
        } else {
          resolve(null);
        }
      }, 500);
    });
  } catch (error) {
    console.error("Error fetching competition:", error);
    return null;
  }
};

export const getDogById = async (id: string | number): Promise<DogInfo | null> => {
  try {
    // In a real application, this would be an API call
    return new Promise((resolve) => {
      setTimeout(() => {
        // Check if the requested ID matches our mock data
        if (Number(id) === mockDog.id) {
          resolve(mockDog);
        } else {
          resolve(null);
        }
      }, 300);
    });
  } catch (error) {
    console.error("Error fetching dog:", error);
    return null;
  }
};

// Function to get related competitions based on dog ID and category
export const getRelatedCompetitions = async (
  dogId?: number,
  category?: string,
  currentCompetitionId?: number,
  limit: number = 3
): Promise<CompetitionResult[]> => {
  try {
    // In a real app, this would be an API call with filtering logic
    return new Promise((resolve) => {
      setTimeout(() => {
        // Filter out the current competition if needed
        let filtered = mockRelatedCompetitions;
        
        if (currentCompetitionId) {
          filtered = filtered.filter(comp => comp.id !== currentCompetitionId);
        }
        
        // First prioritize matching both dog ID and category
        let results = filtered.filter(comp => 
          (dogId && comp.dogId === dogId) && 
          (category && comp.category === category)
        );
        
        // If we don't have enough results, add competitions with matching dog ID
        if (results.length < limit && dogId) {
          const dogMatches = filtered.filter(comp => 
            comp.dogId === dogId && 
            !results.some(r => r.id === comp.id)
          );
          results = [...results, ...dogMatches];
        }
        
        // If we still don't have enough, add competitions with matching category
        if (results.length < limit && category) {
          const categoryMatches = filtered.filter(comp => 
            comp.category === category && 
            !results.some(r => r.id === comp.id)
          );
          results = [...results, ...categoryMatches];
        }
        
        // Limit results to requested amount
        resolve(results.slice(0, limit));
      }, 400);
    });
  } catch (error) {
    console.error("Error fetching related competitions:", error);
    return [];
  }
};

import { format } from 'date-fns';

// Types
export interface CompetitionResult {
  id: number;
  dogId: number;
  dogName: string;
  eventName: string;
  eventDate: Date;
  location: string;
  rank: number;
  title_earned: string;
  judge: string;
  points: number;
  category: string;
  description?: string;
  totalParticipants?: number;
  imageUrl?: string;
  organizerId?: number;
  organizerName?: string;
  eventDateEnd?: Date;
  registrationDeadline?: Date;
  venue?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  fee?: number;
  rules?: string;
  eligibility?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface DogInfo {
  id: number;
  name: string;
  breed: string;
  registrationNumber: string;
  ownerName: string;
  handlerName?: string;
  imageUrl?: string;
  dateOfBirth?: Date;
  color?: string;
  gender?: 'male' | 'female';
  height?: number;
  weight?: number;
  titleAchievements?: string[];
}

export interface CompetitionCategory {
  id: string;
  name: string;
  description?: string;
}

export interface CompetitionSearchParams {
  category?: string;
  location?: string;
  startDate?: Date | string;
  endDate?: Date | string;
  keyword?: string;
  page?: number;
  limit?: number;
}

export interface CompetitionListResponse {
  competitions: CompetitionResult[];
  total: number;
  page: number;
  totalPages: number;
}

// Mock data
const mockCompetitions: CompetitionResult[] = [
  {
    id: 1,
    dogId: 1,
    dogName: "Max",
    eventName: "National Kennel Club Championship",
    eventDate: new Date(2025, 2, 15),
    eventDateEnd: new Date(2025, 2, 17),
    location: "Denver, CO",
    venue: "Denver Convention Center",
    address: "700 14th St",
    city: "Denver",
    state: "CO",
    zipCode: "80202",
    country: "USA",
    rank: 1,
    title_earned: "Best in Show",
    judge: "Elizabeth Johnson",
    points: 25,
    category: "conformation",
    description: "This prestigious annual event showcases the finest purebred dogs from across the country. Dogs are judged based on how closely they conform to their breed's official standard.",
    totalParticipants: 120,
    imageUrl: "https://images.unsplash.com/photo-1558929996-da64ba858215?q=80&w=1000",
    organizerId: 5,
    organizerName: "American Kennel Association",
    registrationDeadline: new Date(2025, 2, 1),
    fee: 150,
    rules: "All dogs must be registered with AKC. Handlers must wear appropriate attire.",
    eligibility: "Open to all purebred dogs with AKC registration",
    createdAt: new Date(2024, 11, 15),
    updatedAt: new Date(2025, 0, 10)
  },
  {
    id: 2,
    dogId: 2,
    dogName: "Bella",
    eventName: "Regional Agility Competition",
    eventDate: new Date(2025, 1, 22),
    location: "Portland, OR",
    rank: 2,
    title_earned: "Agility Master Champion",
    judge: "Robert Wilson",
    points: 18,
    category: "agility",
    description: "A fast-paced event where dogs demonstrate their ability to navigate obstacles with speed and accuracy.",
    imageUrl: "https://images.unsplash.com/photo-1603123853880-a92fafb7809f?q=80&w=1000"
  },
  {
    id: 3,
    dogId: 3,
    dogName: "Charlie",
    eventName: "Obedience Trials Championship",
    eventDate: new Date(2025, 0, 8),
    location: "Chicago, IL",
    rank: 3,
    title_earned: "Utility Dog Excellent",
    judge: "Margaret Thompson",
    points: 15,
    category: "obedience",
    imageUrl: "https://images.unsplash.com/photo-1535930891776-0c2dfb7fda1a?q=80&w=1000"
  },
  {
    id: 4,
    dogId: 4,
    dogName: "Luna",
    eventName: "Mountain State Herding Trials",
    eventDate: new Date(2024, 11, 5),
    location: "Bozeman, MT",
    rank: 1,
    title_earned: "Herding Champion",
    judge: "David Miller",
    points: 22,
    category: "herding",
    imageUrl: "https://images.unsplash.com/photo-1576201836106-db1758fd1c97?q=80&w=1000"
  },
  {
    id: 5,
    dogId: 5,
    dogName: "Cooper",
    eventName: "Southeastern Field Trials",
    eventDate: new Date(2024, 10, 12),
    location: "Atlanta, GA",
    rank: 2,
    title_earned: "Field Champion",
    judge: "Thomas Anderson",
    points: 20,
    category: "field-trials",
    imageUrl: "https://images.unsplash.com/photo-1504595403659-9088ce801e29?q=80&w=1000"
  }
];

const mockDogs: DogInfo[] = [
  {
    id: 1,
    name: "Max",
    breed: "German Shepherd",
    registrationNumber: "AKC123456",
    ownerName: "John Smith",
    handlerName: "Sarah Johnson",
    imageUrl: "https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?q=80&w=1000",
    dateOfBirth: new Date(2021, 3, 15),
    color: "Black and Tan",
    gender: "male",
    height: 26,
    weight: 85,
    titleAchievements: ["Champion", "Best in Show", "Group Winner"]
  },
  {
    id: 2,
    name: "Bella",
    breed: "Border Collie",
    registrationNumber: "AKC789012",
    ownerName: "Emily Davis",
    imageUrl: "https://images.unsplash.com/photo-1503256207526-0d5d80fa2f47?q=80&w=1000",
    gender: "female"
  },
  {
    id: 3,
    name: "Charlie",
    breed: "Golden Retriever",
    registrationNumber: "AKC345678",
    ownerName: "Michael Brown",
    handlerName: "Michael Brown",
    imageUrl: "https://images.unsplash.com/photo-1633722715463-d30f4f325e24?q=80&w=1000",
    gender: "male"
  },
  {
    id: 4,
    name: "Luna",
    breed: "Australian Shepherd",
    registrationNumber: "AKC901234",
    ownerName: "Jennifer Wilson",
    imageUrl: "https://images.unsplash.com/photo-1568572933382-74d440642117?q=80&w=1000",
    gender: "female"
  },
  {
    id: 5,
    name: "Cooper",
    breed: "Labrador Retriever",
    registrationNumber: "AKC567890",
    ownerName: "Robert Martinez",
    imageUrl: "https://images.unsplash.com/photo-1591769225440-811ad39f58b5?q=80&w=1000",
    gender: "male"
  }
];

export const competitionCategories: CompetitionCategory[] = [
  { id: "conformation", name: "Conformation", description: "Dogs are judged based on how well they conform to their breed standard" },
  { id: "obedience", name: "Obedience", description: "Dogs are judged on their ability to perform specific tasks and follow commands" },
  { id: "agility", name: "Agility", description: "Dogs navigate through an obstacle course with speed and accuracy" },
  { id: "field-trials", name: "Field Trials", description: "Dogs demonstrate their hunting and retrieving skills" },
  { id: "herding", name: "Herding", description: "Dogs show their ability to herd livestock" },
  { id: "tracking", name: "Tracking", description: "Dogs use their scent abilities to follow a specific track" },
  { id: "rally", name: "Rally", description: "A dog sport based on obedience with a focus on teamwork" },
  { id: "scent-work", name: "Scent Work", description: "Dogs use their noses to locate specific scents" }
];

// Get competition by ID
export const getCompetitionById = async (id: number | string): Promise<CompetitionResult | null> => {
  try {
    // In a real app, this would be an API call
    // For demo, we'll simulate API delay and use mock data
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const competition = mockCompetitions.find(comp => comp.id === Number(id));
        if (competition) {
          // Ensure all dates are proper Date objects
          resolve({
            ...competition,
            eventDate: competition.eventDate instanceof Date ? competition.eventDate : new Date(competition.eventDate),
            eventDateEnd: competition.eventDateEnd instanceof Date ? competition.eventDateEnd : 
                          competition.eventDateEnd ? new Date(competition.eventDateEnd) : undefined,
            registrationDeadline: competition.registrationDeadline instanceof Date ? competition.registrationDeadline : 
                                  competition.registrationDeadline ? new Date(competition.registrationDeadline) : undefined,
            createdAt: competition.createdAt instanceof Date ? competition.createdAt : 
                      competition.createdAt ? new Date(competition.createdAt) : undefined,
            updatedAt: competition.updatedAt instanceof Date ? competition.updatedAt : 
                      competition.updatedAt ? new Date(competition.updatedAt) : undefined
          });
        } else {
          resolve(null);
        }
      }, 500);
    });
  } catch (error) {
    console.error("Error fetching competition:", error);
    throw error;
  }
};

// Get dog info by ID
export const getDogById = async (id: number | string): Promise<DogInfo | null> => {
  try {
    // In a real app, this would be an API call
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const dog = mockDogs.find(d => d.id === Number(id));
        if (dog) {
          // Ensure date is a proper Date object
          resolve({
            ...dog,
            dateOfBirth: dog.dateOfBirth instanceof Date ? dog.dateOfBirth : 
                        dog.dateOfBirth ? new Date(dog.dateOfBirth) : undefined
          });
        } else {
          resolve(null);
        }
      }, 300);
    });
  } catch (error) {
    console.error("Error fetching dog:", error);
    throw error;
  }
};

// List competitions with filtering
export const listCompetitions = async (
  params: CompetitionSearchParams = {}
): Promise<CompetitionListResponse> => {
  const { 
    category, 
    location, 
    startDate, 
    endDate, 
    keyword, 
    page = 1, 
    limit = 10 
  } = params;
  
  try {
    // In a real app, this would be an API call with query parameters
    return new Promise((resolve) => {
      setTimeout(() => {
        let filtered = [...mockCompetitions];
        
        // Apply filters
        if (category) {
          filtered = filtered.filter(comp => comp.category === category);
        }
        
        if (location) {
          filtered = filtered.filter(comp => 
            comp.location.toLowerCase().includes(location.toLowerCase()) ||
            comp.city?.toLowerCase().includes(location.toLowerCase()) ||
            comp.state?.toLowerCase().includes(location.toLowerCase())
          );
        }
        
        if (startDate) {
          const start = startDate instanceof Date ? startDate : new Date(startDate);
          filtered = filtered.filter(comp => comp.eventDate >= start);
        }
        
        if (endDate) {
          const end = endDate instanceof Date ? endDate : new Date(endDate);
          filtered = filtered.filter(comp => comp.eventDate <= end);
        }
        
        if (keyword) {
          const lowercaseKeyword = keyword.toLowerCase();
          filtered = filtered.filter(comp => 
            comp.eventName.toLowerCase().includes(lowercaseKeyword) ||
            comp.dogName.toLowerCase().includes(lowercaseKeyword) ||
            comp.judge.toLowerCase().includes(lowercaseKeyword) ||
            comp.title_earned.toLowerCase().includes(lowercaseKeyword) ||
            comp.description?.toLowerCase().includes(lowercaseKeyword)
          );
        }
        
        // Sort by event date (most recent first)
        filtered.sort((a, b) => b.eventDate.getTime() - a.eventDate.getTime());
        
        // Calculate pagination
        const total = filtered.length;
        const totalPages = Math.ceil(total / limit);
        const startIdx = (page - 1) * limit;
        const endIdx = startIdx + limit;
        const paginatedResults = filtered.slice(startIdx, endIdx);
        
        resolve({
          competitions: paginatedResults,
          total,
          page,
          totalPages
        });
      }, 500);
    });
  } catch (error) {
    console.error("Error listing competitions:", error);
    throw error;
  }
};

// Get category by ID
export const getCategoryById = (id: string): CompetitionCategory | undefined => {
  return competitionCategories.find(cat => cat.id === id);
};

// Format date with proper error handling
export const formatCompetitionDate = (date: Date | string | undefined, formatString: string = 'MMMM d, yyyy'): string => {
  if (!date) return 'N/A';
  
  try {
    return format(date instanceof Date ? date : new Date(date), formatString);
  } catch (err) {
    console.error("Date formatting error:", err);
    return "Invalid date";
  }
};

// Get related competitions (same category or same dog)
export const getRelatedCompetitions = async (
  competitionId: number | string,
  limit: number = 3
): Promise<CompetitionResult[]> => {
  try {
    const competition = await getCompetitionById(competitionId);
    if (!competition) return [];
    
    return new Promise((resolve) => {
      setTimeout(() => {
        // Get competitions in the same category or for the same dog, excluding the current one
        let related = mockCompetitions.filter(comp => 
          comp.id !== Number(competitionId) && 
          (comp.category === competition.category || comp.dogId === competition.dogId)
        );
        
        // Sort by most recent
        related.sort((a, b) => b.eventDate.getTime() - a.eventDate.getTime());
        
        // Limit results
        related = related.slice(0, limit);
        
        resolve(related);
      }, 300);
    });
  } catch (error) {
    console.error("Error fetching related competitions:", error);
    return [];
  }
};

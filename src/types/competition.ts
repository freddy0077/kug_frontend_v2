// Type definitions for competitions

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
}

export interface DogInfo {
  id: number;
  name: string;
  breed: string;
  registrationNumber: string;
  ownerName: string;
  handlerName?: string;
  imageUrl?: string;
}

export interface CompetitionCategory {
  id: string;
  name: string;
  description?: string;
}

export const categories: CompetitionCategory[] = [
  { id: "conformation", name: "Conformation", description: "Dogs are judged based on how well they conform to their breed standard" },
  { id: "obedience", name: "Obedience", description: "Dogs are judged on their ability to perform specific tasks and follow commands" },
  { id: "agility", name: "Agility", description: "Dogs navigate through an obstacle course with speed and accuracy" },
  { id: "field-trials", name: "Field Trials", description: "Dogs demonstrate their hunting and retrieving skills" },
  { id: "herding", name: "Herding", description: "Dogs show their ability to herd livestock" },
  { id: "tracking", name: "Tracking", description: "Dogs use their scent abilities to follow a specific track" },
  { id: "rally", name: "Rally", description: "A dog sport based on obedience with a focus on teamwork" },
  { id: "scent-work", name: "Scent Work", description: "Dogs use their noses to locate specific scents" }
];

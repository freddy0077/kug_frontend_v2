// Health Record TypeScript Types
export enum HealthRecordType {
  VACCINATION = 'VACCINATION',
  EXAMINATION = 'EXAMINATION',
  TREATMENT = 'TREATMENT', 
  SURGERY = 'SURGERY',
  TEST = 'TEST',
  OTHER = 'OTHER'
}

export interface HealthRecordFilterOptions {
  dogId?: string;
  type?: HealthRecordType;
  startDate?: string;
  endDate?: string;
}

export interface HealthRecord {
  id: string;
  dogId: string;
  date: string;
  veterinarian?: string;
  vetName?: string; // Alias for veterinarian_name
  description: string; // Not 'diagnosis' as per migration/seeder alignment
  results?: string; // Not 'test_results' as per migration/seeder alignment
  type: HealthRecordType;
  attachmentUrl?: string;
  attachments?: string; // Alias for document_url
  createdAt: string;
  updatedAt: string;
  dog?: {
    id: string;
    name: string;
    breed: string;
    dateOfBirth: string;
    currentOwner?: {
      id: string;
      name: string;
    };
  };
}

export interface DogOption {
  id: string;
  name: string;
}

// Health record creation/update input types
export interface CreateHealthRecordInput {
  dogId: string;
  date: string;
  veterinarian?: string;
  description: string;
  results?: string;
  type: HealthRecordType;
  attachmentUrl?: string;
}

export interface UpdateHealthRecordInput {
  id: string;
  date?: string;
  veterinarian?: string;
  description?: string;
  results?: string;
  type?: HealthRecordType;
  attachmentUrl?: string;
}

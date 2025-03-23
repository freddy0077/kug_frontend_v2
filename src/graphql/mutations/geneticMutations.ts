import { gql } from '@apollo/client';

// Create a new genetic trait
export const CREATE_GENETIC_TRAIT = gql`
  mutation CreateGeneticTrait(
    $name: String!, 
    $description: String, 
    $inheritancePattern: InheritancePattern!, 
    $healthImplications: String
  ) {
    createGeneticTrait(
      name: $name, 
      description: $description, 
      inheritancePattern: $inheritancePattern, 
      healthImplications: $healthImplications
    ) {
      id
      name
      description
      inheritancePattern
      healthImplications
    }
  }
`;

// Update an existing genetic trait
export const UPDATE_GENETIC_TRAIT = gql`
  mutation UpdateGeneticTrait(
    $id: ID!, 
    $name: String, 
    $description: String, 
    $inheritancePattern: InheritancePattern, 
    $healthImplications: String
  ) {
    updateGeneticTrait(
      id: $id, 
      name: $name, 
      description: $description, 
      inheritancePattern: $inheritancePattern, 
      healthImplications: $healthImplications
    ) {
      id
      name
      description
      inheritancePattern
      healthImplications
    }
  }
`;

// Delete a genetic trait
export const DELETE_GENETIC_TRAIT = gql`
  mutation DeleteGeneticTrait($id: ID!) {
    deleteGeneticTrait(id: $id)
  }
`;

// Create an allele for a trait
export const CREATE_ALLELE = gql`
  mutation CreateAllele(
    $traitId: ID!, 
    $symbol: String!, 
    $name: String!, 
    $description: String, 
    $dominant: Boolean!
  ) {
    createAllele(
      traitId: $traitId, 
      symbol: $symbol, 
      name: $name, 
      description: $description, 
      dominant: $dominant
    ) {
      id
      symbol
      name
      description
      dominant
      traitId
    }
  }
`;

// Update an allele
export const UPDATE_ALLELE = gql`
  mutation UpdateAllele(
    $id: ID!, 
    $symbol: String, 
    $name: String, 
    $description: String, 
    $dominant: Boolean
  ) {
    updateAllele(
      id: $id, 
      symbol: $symbol, 
      name: $name, 
      description: $description, 
      dominant: $dominant
    ) {
      id
      symbol
      name
      description
      dominant
    }
  }
`;

// Delete an allele
export const DELETE_ALLELE = gql`
  mutation DeleteAllele($id: ID!) {
    deleteAllele(id: $id)
  }
`;

// Record a genotype for a dog
export const RECORD_DOG_GENOTYPE = gql`
  mutation RecordDogGenotype(
    $dogId: ID!, 
    $traitId: ID!, 
    $genotype: String!, 
    $testMethod: GeneticTestMethod, 
    $testDate: DateTime, 
    $confidence: Float, 
    $notes: String
  ) {
    recordDogGenotype(
      dogId: $dogId, 
      traitId: $traitId, 
      genotype: $genotype, 
      testMethod: $testMethod, 
      testDate: $testDate, 
      confidence: $confidence, 
      notes: $notes
    ) {
      id
      dogId
      traitId
      genotype
      testMethod
      testDate
      confidence
      notes
    }
  }
`;

// Update a dog's genotype
export const UPDATE_DOG_GENOTYPE = gql`
  mutation UpdateDogGenotype(
    $id: ID!, 
    $genotype: String, 
    $testMethod: GeneticTestMethod, 
    $testDate: DateTime, 
    $confidence: Float, 
    $notes: String
  ) {
    updateDogGenotype(
      id: $id, 
      genotype: $genotype, 
      testMethod: $testMethod, 
      testDate: $testDate, 
      confidence: $confidence, 
      notes: $notes
    ) {
      id
      dogId
      traitId
      genotype
      testMethod
      testDate
      confidence
      notes
    }
  }
`;

// Delete a dog's genotype
export const DELETE_DOG_GENOTYPE = gql`
  mutation DeleteDogGenotype($id: ID!) {
    deleteDogGenotype(id: $id)
  }
`;

// Create trait prevalence for a breed
export const CREATE_BREED_TRAIT_PREVALENCE = gql`
  mutation CreateBreedTraitPrevalence(
    $breedId: ID!, 
    $traitId: ID!, 
    $frequency: Float!, 
    $studyReference: String, 
    $notes: String
  ) {
    createBreedTraitPrevalence(
      breedId: $breedId, 
      traitId: $traitId, 
      frequency: $frequency, 
      studyReference: $studyReference, 
      notes: $notes
    ) {
      id
      breedId
      traitId
      frequency
      studyReference
      notes
    }
  }
`;

// Update breed trait prevalence
export const UPDATE_BREED_TRAIT_PREVALENCE = gql`
  mutation UpdateBreedTraitPrevalence(
    $id: ID!, 
    $frequency: Float, 
    $studyReference: String, 
    $notes: String
  ) {
    updateBreedTraitPrevalence(
      id: $id, 
      frequency: $frequency, 
      studyReference: $studyReference, 
      notes: $notes
    ) {
      id
      frequency
      studyReference
      notes
    }
  }
`;

// Delete breed trait prevalence
export const DELETE_BREED_TRAIT_PREVALENCE = gql`
  mutation DeleteBreedTraitPrevalence($id: ID!) {
    deleteBreedTraitPrevalence(id: $id)
  }
`;

// Save genetic analysis for a breeding pair
export const SAVE_GENETIC_ANALYSIS = gql`
  mutation SaveGeneticAnalysis(
    $sireId: ID!, 
    $damId: ID!, 
    $breedingPairId: ID, 
    $recommendations: String
  ) {
    saveGeneticAnalysis(
      sireId: $sireId, 
      damId: $damId, 
      breedingPairId: $breedingPairId, 
      recommendations: $recommendations
    ) {
      id
      sireId
      damId
      breedingPairId
      overallCompatibility
      recommendations
    }
  }
`;

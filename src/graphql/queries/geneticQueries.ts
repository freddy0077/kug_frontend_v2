import { gql } from '@apollo/client';

// Get all genetic traits, optionally filtered by breed
export const GET_GENETIC_TRAITS = gql`
  query GetGeneticTraits($breedId: ID) {
    geneticTraits(breedId: $breedId) {
      id
      name
      description
      inheritancePattern
      alleles {
        id
        symbol
        name
        description
        dominant
      }
      healthImplications
    }
  }
`;

// Get a specific genetic trait by ID
export const GET_GENETIC_TRAIT = gql`
  query GetGeneticTrait($id: ID!) {
    geneticTrait(id: $id) {
      id
      name
      description
      inheritancePattern
      alleles {
        id
        symbol
        name
        description
        dominant
      }
      breedPrevalence {
        id
        breedId
        breed {
          id
          name
        }
        frequency
        studyReference
      }
      healthImplications
      testingOptions {
        id
        name
        provider
        description
        accuracy
        cost
        turnaroundTime
        sampleType
        url
      }
    }
  }
`;

// Get all genotypes for a specific dog
export const GET_DOG_GENOTYPES = gql`
  query GetDogGenotypes($dogId: ID!) {
    dogGenotypes(dogId: $dogId) {
      id
      dogId
      dog {
        id
        name
        breed
        registrationNumber
      }
      traitId
      trait {
        id
        name
        description
        inheritancePattern
      }
      genotype
      testMethod
      testDate
      confidence
      notes
    }
  }
`;

// Get genetic profile for a specific breed
export const GET_BREED_GENETIC_PROFILE = gql`
  query GetBreedGeneticProfile($breedId: ID!) {
    breedGeneticProfile(breedId: $breedId) {
      id
      breedId
      breed {
        id
        name
      }
      traitId
      trait {
        id
        name
        description
        inheritancePattern
      }
      frequency
      studyReference
      notes
    }
  }
`;

// Get available genetic tests
export const GET_GENETIC_TESTS = gql`
  query GetGeneticTests {
    geneticTests {
      id
      name
      provider
      description
      traits {
        id
        name
      }
      accuracy
      cost
      turnaroundTime
      sampleType
      url
    }
  }
`;

// Calculate genetic compatibility between two dogs
export const CALCULATE_GENETIC_COMPATIBILITY = gql`
  query CalculateGeneticCompatibility($sireId: ID!, $damId: ID!) {
    calculateGeneticCompatibility(sireId: $sireId, damId: $damId) {
      id
      sireId
      sire {
        id
        name
        breed
        registrationNumber
      }
      damId
      dam {
        id
        name
        breed
        registrationNumber
      }
      traitPredictions {
        id
        traitId
        trait {
          id
          name
          description
        }
        possibleGenotypes {
          genotype
          probability
          phenotype
          isCarrier
          healthImplications
        }
        notes
      }
      overallCompatibility
      riskFactors {
        traitId
        trait {
          id
          name
        }
        riskLevel
        description
        recommendations
      }
      recommendations
    }
  }
`;

// Predict offspring traits for specific traits
export const PREDICT_OFFSPRING_TRAITS = gql`
  query PredictOffspringTraits($sireId: ID!, $damId: ID!, $traitIds: [ID!]) {
    predictOffspringTraits(sireId: $sireId, damId: $damId, traitIds: $traitIds) {
      id
      traitId
      trait {
        id
        name
        description
        inheritancePattern
      }
      possibleGenotypes {
        genotype
        probability
        phenotype
        isCarrier
        healthImplications
      }
      notes
    }
  }
`;

// Recommend breeding pairs for a dog
export const RECOMMEND_BREEDING_PAIRS = gql`
  query RecommendBreedingPairs($dogId: ID!, $count: Int) {
    recommendBreedingPairs(dogId: $dogId, count: $count) {
      id
      sireId
      sire {
        id
        name
        breed
        registrationNumber
        mainImageUrl
      }
      damId
      dam {
        id
        name
        breed
        registrationNumber
        mainImageUrl
      }
      geneticCompatibilityScore
      status
      geneticAnalysis {
        id
        overallCompatibility
        recommendations
      }
    }
  }
`;

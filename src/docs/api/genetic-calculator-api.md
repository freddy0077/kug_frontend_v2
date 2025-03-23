# Genetic Calculator API Documentation

## Overview

The Genetic Calculator API provides endpoints for calculating genetic probabilities for dog breeding. This API supports the frontend genetic calculator tool and allows for more complex calculations than can be performed client-side.

## Base URL

```
https://api.dogpedigree.com/v1
```

## Authentication

All API requests require authentication using a JWT token.

```
Authorization: Bearer {your_jwt_token}
```

## Endpoints

### Calculate Genetic Probabilities

Calculate the probability of offspring genotypes based on parent genotypes.

**URL**: `/genetics/calculate`

**Method**: `POST`

**Auth required**: Yes

**Permissions required**: `OWNER`, `ADMIN`, or `HANDLER` role

**Request Body**:

```json
{
  "parent1Genotype": "Bb Ee Ky ky",
  "parent2Genotype": "bb Ee Ky ky",
  "includeExplanations": true,
  "includeTraitDescriptions": true
}
```

**Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| parent1Genotype | string | Yes | Genotype of parent 1 with space-separated gene pairs (e.g., "Bb Ee") |
| parent2Genotype | string | Yes | Genotype of parent 2 with space-separated gene pairs (e.g., "bb ee") |
| includeExplanations | boolean | No | Whether to include detailed explanations for each outcome |
| includeTraitDescriptions | boolean | No | Whether to include phenotype descriptions |

**Success Response**:

- **Code**: 200 OK
- **Content example**:

```json
{
  "results": {
    "Bb Ee Ky ky": {
      "probability": 25.0,
      "phenotype": "Black with possible brindling",
      "explanation": "Black (B-) with extension (E-) and dominant black masked by brindle (Kbr)"
    },
    "Bb Ee Ky Ky": {
      "probability": 25.0,
      "phenotype": "Black",
      "explanation": "Black (B-) with extension (E-) and dominant black (K-)"
    },
    "Bb ee Ky ky": {
      "probability": 25.0,
      "phenotype": "Red/Yellow with possible brindling",
      "explanation": "Black pigment present (B-) but masked by recessive red (ee) with brindle possible"
    },
    "Bb ee Ky Ky": {
      "probability": 25.0,
      "phenotype": "Red/Yellow",
      "explanation": "Black pigment present (B-) but masked by recessive red (ee)"
    }
  },
  "summaryByTrait": {
    "coatColor": {
      "Black": 50.0,
      "Red/Yellow": 50.0
    },
    "brindle": {
      "Possible brindle": 50.0,
      "No brindle": 50.0
    }
  }
}
```

**Error Responses**:

- **Code**: 400 Bad Request
  - **Content**: `{ "error": "Invalid genotype format" }`

- **Code**: 401 Unauthorized
  - **Content**: `{ "error": "Authentication required" }`

- **Code**: 403 Forbidden
  - **Content**: `{ "error": "Insufficient permissions" }`

### Get Common Dog Genetic Markers

Retrieve a list of common genetic markers used in dog breeding.

**URL**: `/genetics/markers`

**Method**: `GET`

**Auth required**: Yes

**Permissions required**: Any authenticated user

**Query Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| category | string | No | Filter markers by category (coat_color, coat_length, etc.) |
| breed | string | No | Filter for markers common in a specific breed |

**Success Response**:

- **Code**: 200 OK
- **Content example**:

```json
{
  "markers": [
    {
      "id": "B_locus",
      "alleles": [
        {
          "symbol": "B",
          "name": "Black",
          "description": "Dominant - Allows black pigment production",
          "category": "coat_color"
        },
        {
          "symbol": "b",
          "name": "Brown/Liver/Chocolate",
          "description": "Recessive - Dilutes black pigment to brown",
          "category": "coat_color"
        }
      ]
    },
    {
      "id": "E_locus",
      "alleles": [
        {
          "symbol": "E",
          "name": "Extension",
          "description": "Dominant - Allows black pigment",
          "category": "coat_color"
        },
        {
          "symbol": "e",
          "name": "Recessive red",
          "description": "Recessive - Prevents black pigment",
          "category": "coat_color"
        }
      ]
    }
    // Additional markers...
  ]
}
```

### Get Breed-Specific Genetic Information

Retrieve genetic information specific to a dog breed.

**URL**: `/genetics/breeds/{breedId}`

**Method**: `GET`

**Auth required**: Yes

**Permissions required**: Any authenticated user

**URL Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| breedId | string | Yes | ID of the breed |

**Success Response**:

- **Code**: 200 OK
- **Content example**:

```json
{
  "breed": {
    "id": "labrador_retriever",
    "name": "Labrador Retriever"
  },
  "commonGenotypes": [
    {
      "trait": "Coat Color",
      "genotypes": [
        {
          "genotype": "BB EE",
          "phenotype": "Black",
          "frequency": "Common"
        },
        {
          "genotype": "bb EE",
          "phenotype": "Chocolate",
          "frequency": "Common"
        },
        {
          "genotype": "-- ee",
          "phenotype": "Yellow",
          "frequency": "Common"
        }
      ]
    }
  ],
  "geneticDisorders": [
    {
      "name": "Exercise Induced Collapse",
      "gene": "DNM1",
      "inheritance": "Autosomal Recessive",
      "testAvailable": true,
      "description": "Causes collapse during intense exercise"
    }
  ]
}
```

### Save Genetic Calculation

Save a genetic calculation result for future reference.

**URL**: `/genetics/calculations`

**Method**: `POST`

**Auth required**: Yes

**Permissions required**: `OWNER`, `ADMIN`, or `HANDLER` role

**Request Body**:

```json
{
  "name": "Lab Breeding Project - Color Prediction",
  "parent1": {
    "id": "dog_123",  // Optional - link to existing dog
    "name": "Max",
    "genotype": "Bb Ee"
  },
  "parent2": {
    "id": "dog_456",  // Optional - link to existing dog
    "name": "Bella",
    "genotype": "bb ee"
  },
  "calculationResults": {
    // The full results object as returned from /genetics/calculate
  },
  "notes": "Planning breeding for chocolate and yellow puppies"
}
```

**Success Response**:

- **Code**: 201 Created
- **Content**:

```json
{
  "id": "calc_789",
  "created": "2025-03-22T18:15:00Z",
  "name": "Lab Breeding Project - Color Prediction",
  "url": "/genetics/calculations/calc_789"
}
```

### Get Saved Genetic Calculations

Retrieve previously saved genetic calculations.

**URL**: `/genetics/calculations`

**Method**: `GET`

**Auth required**: Yes

**Permissions required**: Any authenticated user

**Query Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| limit | integer | No | Maximum number of results to return (default: 20) |
| offset | integer | No | Number of results to skip (default: 0) |
| dogId | string | No | Filter by calculations involving a specific dog |

**Success Response**:

- **Code**: 200 OK
- **Content**:

```json
{
  "total": 5,
  "limit": 20,
  "offset": 0,
  "calculations": [
    {
      "id": "calc_789",
      "name": "Lab Breeding Project - Color Prediction",
      "created": "2025-03-22T18:15:00Z",
      "parent1": {
        "name": "Max",
        "breedName": "Labrador Retriever"
      },
      "parent2": {
        "name": "Bella",
        "breedName": "Labrador Retriever"
      }
    }
    // Additional saved calculations...
  ]
}
```

## Error Codes

| Code | Description |
|------|-------------|
| 400  | Bad Request - Invalid input parameters |
| 401  | Unauthorized - Authentication required |
| 403  | Forbidden - Insufficient permissions |
| 404  | Not Found - Requested resource not found |
| 500  | Server Error - Unexpected error on server |

## Rate Limits

- 100 requests per minute per user
- 1000 requests per day per user

Exceeding these limits will result in a 429 Too Many Requests response.

## Example Usage with cURL

```bash
# Calculate genetic probabilities
curl -X POST https://api.dogpedigree.com/v1/genetics/calculate \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "parent1Genotype": "Bb Ee",
    "parent2Genotype": "bb ee",
    "includeExplanations": true
  }'
```

## SDK Examples

### JavaScript

```javascript
const geneticsApi = new DogPedigreeAPI.Genetics(apiToken);

// Calculate probabilities
const result = await geneticsApi.calculate({
  parent1Genotype: "Bb Ee",
  parent2Genotype: "bb ee",
  includeExplanations: true
});

console.log(result.results);
```

### Python

```python
from dog_pedigree_api import GeneticsAPI

genetics_api = GeneticsAPI(api_token)

# Calculate probabilities
result = genetics_api.calculate(
    parent1_genotype="Bb Ee",
    parent2_genotype="bb ee",
    include_explanations=True
)

print(result["results"])
```

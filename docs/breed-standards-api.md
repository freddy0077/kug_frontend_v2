# Breed Standards API Documentation

## Overview

The Breed Standards API provides access to official breed standards from various kennel clubs and organizations worldwide. This API allows applications to retrieve detailed information about dog breed standards, including physical characteristics, temperament, and historical background.

## Base URL

```
https://api.dogpedigree.com/v1
```

## Authentication

All API requests require authentication using an API key. Include your API key in the request header:

```
Authorization: Bearer YOUR_API_KEY
```

To obtain an API key, please contact the administrator or register through the developer portal.

## Endpoints

### List Breeds

Returns a paginated list of all available dog breeds with basic information.

```
GET /breeds
```

#### Query Parameters

| Parameter | Type   | Required | Description                                     |
|-----------|--------|----------|-------------------------------------------------|
| page      | number | No       | Page number (default: 1)                        |
| limit     | number | No       | Number of results per page (default: 20, max: 100) |
| search    | string | No       | Search term to filter breeds by name            |
| group     | string | No       | Filter by breed group/category                  |
| origin    | string | No       | Filter by country of origin                     |
| size      | string | No       | Filter by size (toy, small, medium, large, giant) |

#### Response

```json
{
  "data": [
    {
      "id": "german-shepherd",
      "name": "German Shepherd",
      "group": "Herding",
      "origin": "Germany",
      "size": "large",
      "organization": "AKC",
      "imageUrl": "https://images.dogpedigree.com/breeds/german-shepherd.jpg"
    },
    // More breeds...
  ],
  "pagination": {
    "total": 195,
    "pages": 10,
    "current": 1,
    "limit": 20
  }
}
```

### Get Breed Standard

Returns detailed standard information for a specific breed.

```
GET /breeds/{breedId}/standard
```

#### Path Parameters

| Parameter | Type   | Required | Description                             |
|-----------|--------|----------|-----------------------------------------|
| breedId   | string | Yes      | Unique identifier for the breed         |

#### Query Parameters

| Parameter     | Type   | Required | Description                                         |
|---------------|--------|----------|-----------------------------------------------------|
| organization  | string | No       | Specific organization standard (AKC, FCI, KC, etc.) |
| language      | string | No       | Language for the standard (default: en)             |

#### Response

```json
{
  "id": "german-shepherd",
  "name": "German Shepherd",
  "organization": "AKC",
  "lastUpdated": "2023-05-10",
  "generalInfo": {
    "group": "Herding",
    "origin": "Germany",
    "size": "large",
    "lifeExpectancy": "7-10 years",
    "description": "The German Shepherd Dog is a breed of medium to large-sized working dog that originated in Germany."
  },
  "standard": {
    "generalAppearance": "The German Shepherd Dog is a medium-sized, slightly elongated, powerful, and well-muscled dog, with a dry and firm overall appearance.",
    "sizeProportionSubstance": {
      "height": {
        "male": "24-26 inches",
        "female": "22-24 inches"
      },
      "weight": {
        "male": "65-90 pounds",
        "female": "50-70 pounds"
      },
      "proportions": "The German Shepherd Dog is slightly longer than tall, with the most desirable proportion as 10 to 8½."
    },
    "headAndSkull": "The head is noble, cleanly chiseled, strong without coarseness, but above all not fine, and in proportion to the body.",
    "body": "The body between the withers and the croup is well muscled. The line of the back slopes downward from the withers to the horizontal croup.",
    "forequarters": "The shoulder blades are long and well laid back. Upper arm connects at approximately a right angle to the shoulder blade.",
    "hindquarters": "The hindquarters are broad and well muscled. The upper thigh is broad and well muscled.",
    "coatAndColor": {
      "coat": "The ideal coat is a double coat of medium length. The outer coat should be as dense as possible, hair straight, harsh and lying close to the body.",
      "colors": [
        {
          "name": "Bi-Color",
          "description": "Rich tan to red with black saddle"
        },
        {
          "name": "Black",
          "description": "Solid black"
        },
        {
          "name": "Sable",
          "description": "Various shades of sable to gray"
        }
      ],
      "faults": "Long, soft, silky coat. Wavy or curly coat."
    },
    "gait": "The gait is outreaching, elastic, seemingly without effort, smooth and rhythmic.",
    "temperament": "The breed has a distinct personality marked by direct and fearless, but not hostile, expression, self-confidence, and a certain aloofness."
  },
  "disqualifications": [
    "Cropped or hanging ears",
    "Dogs with noses not predominantly black",
    "Pink or spotted nose"
  ],
  "officialLinks": [
    {
      "organization": "AKC",
      "url": "https://www.akc.org/dog-breeds/german-shepherd-dog/"
    },
    {
      "organization": "FCI",
      "url": "https://www.fci.be/en/nomenclature/GERMAN-SHEPHERD-DOG-166.html"
    }
  ],
  "images": [
    {
      "type": "standard",
      "url": "https://images.dogpedigree.com/breeds/german-shepherd-standard.jpg"
    },
    {
      "type": "profile",
      "url": "https://images.dogpedigree.com/breeds/german-shepherd-profile.jpg"
    }
  ]
}
```

### Get Breed Standards Organizations

Returns a list of all organizations that provide breed standards.

```
GET /organizations
```

#### Response

```json
{
  "data": [
    {
      "id": "akc",
      "name": "American Kennel Club",
      "abbreviation": "AKC",
      "country": "United States",
      "website": "https://www.akc.org",
      "breedCount": 195
    },
    {
      "id": "fci",
      "name": "Fédération Cynologique Internationale",
      "abbreviation": "FCI",
      "country": "International",
      "website": "https://www.fci.be",
      "breedCount": 344
    },
    {
      "id": "kc",
      "name": "The Kennel Club",
      "abbreviation": "KC",
      "country": "United Kingdom",
      "website": "https://www.thekennelclub.org.uk",
      "breedCount": 215
    },
    {
      "id": "ckc",
      "name": "Canadian Kennel Club",
      "abbreviation": "CKC",
      "country": "Canada",
      "website": "https://www.ckc.ca",
      "breedCount": 175
    }
  ]
}
```

### Get Breed Groups

Returns a list of all breed groups/categories.

```
GET /breed-groups
```

#### Query Parameters

| Parameter     | Type   | Required | Description                                         |
|---------------|--------|----------|-----------------------------------------------------|
| organization  | string | No       | Filter by organization (AKC, FCI, KC, etc.)         |

#### Response

```json
{
  "data": [
    {
      "id": "sporting",
      "name": "Sporting Group",
      "description": "Breeds in the Sporting Group were bred to assist hunters in finding and retrieving game.",
      "breedCount": 32,
      "organization": "AKC"
    },
    {
      "id": "hound",
      "name": "Hound Group",
      "description": "Most hounds share the common ancestral trait of being used for hunting.",
      "breedCount": 30,
      "organization": "AKC"
    },
    // More groups...
  ]
}
```

### Compare Breed Standards

Compares standards for the same breed across different organizations.

```
GET /breeds/{breedId}/compare
```

#### Path Parameters

| Parameter | Type   | Required | Description                             |
|-----------|--------|----------|-----------------------------------------|
| breedId   | string | Yes      | Unique identifier for the breed         |

#### Query Parameters

| Parameter     | Type   | Required | Description                                         |
|---------------|--------|----------|-----------------------------------------------------|
| organizations | string | No       | Comma-separated list of organization codes (default: all) |

#### Response

```json
{
  "breed": {
    "id": "german-shepherd",
    "name": "German Shepherd"
  },
  "comparisons": [
    {
      "organization": "AKC",
      "sizeMale": "24-26 inches",
      "sizeFemale": "22-24 inches",
      "weightMale": "65-90 pounds",
      "weightFemale": "50-70 pounds",
      "acceptedColors": ["Black and Tan", "Black", "Sable"]
    },
    {
      "organization": "FCI",
      "sizeMale": "60-65 cm",
      "sizeFemale": "55-60 cm",
      "weightMale": "30-40 kg",
      "weightFemale": "22-32 kg",
      "acceptedColors": ["Black with rust-brown, brown, yellow to light gray markings", "Solid black", "Solid gray"]
    }
  ]
}
```

## Error Responses

The API uses standard HTTP status codes to indicate the success or failure of a request.

### Common Error Codes

| Status Code | Description                                                   |
|-------------|---------------------------------------------------------------|
| 400         | Bad Request - Invalid request format or parameters            |
| 401         | Unauthorized - Authentication is required                     |
| 403         | Forbidden - Insufficient permissions                          |
| 404         | Not Found - Resource not found                                |
| 429         | Too Many Requests - Rate limit exceeded                       |
| 500         | Internal Server Error - Something went wrong on the server    |

### Error Response Format

```json
{
  "error": {
    "code": "NOT_FOUND",
    "message": "Breed not found",
    "details": "The requested breed 'german-shepherdd' does not exist. Check the breed ID or try searching for similar breeds."
  }
}
```

## Rate Limiting

API requests are limited to:
- 60 requests per minute for Basic tier
- 300 requests per minute for Premium tier
- 1000 requests per minute for Enterprise tier

Rate limit information is included in the response headers:

```
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 58
X-RateLimit-Reset: 1616789452
```

## Versioning

The API uses URL versioning. The current version is `v1`. We recommend specifying the version in your requests to ensure compatibility as the API evolves.

## Webhooks

Premium and Enterprise tiers can subscribe to webhooks for breed standard updates:

```
POST /webhooks/subscribe
```

Request body:
```json
{
  "url": "https://your-app.com/api/breed-updates",
  "events": ["standard.updated", "breed.added"],
  "breeds": ["german-shepherd", "labrador-retriever"] // Optional, leave empty for all breeds
}
```

## SDK Support

Official SDKs are available for:
- JavaScript/TypeScript
- Python
- PHP
- Ruby
- Java

## Support

For API support, please contact api-support@dogpedigree.com or visit our developer forum at https://developers.dogpedigree.com/forum.

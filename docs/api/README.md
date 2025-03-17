# Dog Pedigree System GraphQL API Documentation

This directory contains documentation for all GraphQL APIs required to support the Dog Pedigree System frontend. These specifications are designed to help backend developers implement the necessary GraphQL resolvers and types.

## API Structure

The GraphQL API is organized into the following domains:

1. [Dogs API](./dogs.md) - Core operations for managing dog profiles and information
2. [Competitions API](./competitions.md) - APIs for competition results and events
3. [Health Records API](./health-records.md) - APIs for managing dog health information
4. [Pedigree API](./pedigree.md) - APIs for lineage and breeding information
5. [Litters API](./litters.md) - APIs for litter registration and puppy management
6. [Users API](./users.md) - APIs for user management and authentication
7. [Ownerships API](./ownerships.md) - APIs for dog ownership and transfer management
8. [Events API](./events.md) - APIs for club and general events system
9. [Breeding Programs API](./breeding-programs.md) - APIs for breeding program planning and management
10. [Logs API](./logs.md) - APIs for system logs and audit trail (admin-only)

## Getting Started

To implement these APIs, we recommend using:
- Apollo Server or similar GraphQL server
- TypeScript for type safety
- Proper error handling as specified in each API document
- Field-level authorization as indicated

## Common Patterns

All APIs follow these common patterns:
- Pagination using `offset` and `limit` parameters
- Consistent error handling with error codes
- Field-based authorization
- Optimized query design with selective field loading

## Integration with Frontend

These API specifications align with the frontend components and pages to ensure seamless integration. Each API document includes details on which frontend components consume the specific operations.

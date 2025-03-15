# Users API

This document outlines the GraphQL API for user management and authentication in the Dog Pedigree System.

## Types

### User

```graphql
type User {
  id: ID!
  email: String!
  firstName: String!
  lastName: String!
  fullName: String!
  role: UserRole!
  profileImageUrl: String
  isActive: Boolean!
  lastLogin: DateTime
  owner: Owner
  createdAt: DateTime!
  updatedAt: DateTime!
}

enum UserRole {
  ADMIN
  OWNER
  HANDLER
  CLUB
  VIEWER
}

type AuthPayload {
  token: String!
  user: User!
  expiresAt: DateTime!
}
```

## Queries

### getCurrentUser

Fetches the currently authenticated user.

```graphql
query getCurrentUser {
  me {
    id
    email
    firstName
    lastName
    fullName
    role
    profileImageUrl
    lastLogin
    owner {
      id
      name
      contactEmail
      contactPhone
    }
  }
}
```

### getUsers

Admin-only query to fetch users (paginated).

```graphql
query getUsers(
  $offset: Int = 0
  $limit: Int = 20
  $searchTerm: String
  $role: UserRole
  $isActive: Boolean
) {
  users(
    offset: $offset
    limit: $limit
    searchTerm: $searchTerm
    role: $role
    isActive: $isActive
  ) {
    totalCount
    hasMore
    items {
      id
      email
      fullName
      role
      isActive
      createdAt
      owner {
        id
        name
      }
    }
  }
}
```

### getUserById

Fetches detailed information about a specific user.

```graphql
query getUserById($id: ID!) {
  user(id: $id) {
    id
    email
    firstName
    lastName
    fullName
    role
    profileImageUrl
    isActive
    lastLogin
    createdAt
    updatedAt
    owner {
      id
      name
      contactEmail
      contactPhone
      address
      dogs {
        id
        name
        breed
      }
    }
  }
}
```

## Mutations

### login

Authenticates a user and returns a JWT token.

```graphql
mutation login($email: String!, $password: String!) {
  login(email: $email, password: $password) {
    token
    user {
      id
      email
      fullName
      role
    }
    expiresAt
  }
}
```

### register

Registers a new user.

```graphql
mutation register($input: RegisterInput!) {
  register(input: $input) {
    token
    user {
      id
      email
      fullName
      role
    }
    expiresAt
  }
}

input RegisterInput {
  email: String!
  password: String!
  firstName: String!
  lastName: String!
  role: UserRole!
  ownerInfo: OwnerInfoInput
}

input OwnerInfoInput {
  name: String!
  contactEmail: String
  contactPhone: String
  address: String
}
```

### updateUser

Updates a user's profile information.

```graphql
mutation updateUser($id: ID!, $input: UpdateUserInput!) {
  updateUser(id: $id, input: $input) {
    id
    email
    firstName
    lastName
    fullName
    profileImageUrl
  }
}

input UpdateUserInput {
  email: String
  firstName: String
  lastName: String
  password: String
  profileImageUrl: String
  ownerInfo: OwnerInfoInput
}
```

### changePassword

Changes a user's password.

```graphql
mutation changePassword($currentPassword: String!, $newPassword: String!) {
  changePassword(currentPassword: $currentPassword, newPassword: $newPassword) {
    success
    message
  }
}
```

### updateUserRole

Admin-only mutation to update a user's role.

```graphql
mutation updateUserRole($userId: ID!, $role: UserRole!) {
  updateUserRole(userId: $userId, role: $role) {
    id
    email
    role
  }
}
```

### deactivateUser

Admin-only mutation to deactivate a user account.

```graphql
mutation deactivateUser($userId: ID!) {
  deactivateUser(userId: $userId) {
    id
    isActive
  }
}
```

## Error Handling

- `INVALID_CREDENTIALS`: When login credentials are incorrect
- `EMAIL_EXISTS`: When attempting to register with an existing email
- `USER_NOT_FOUND`: When requested user does not exist
- `UNAUTHORIZED`: When attempting an action without sufficient permissions
- `INVALID_PASSWORD`: When password does not meet complexity requirements
- `INACTIVE_USER`: When attempting to use an inactive account

## Frontend Components Using This API

- Login Page (`/src/app/auth/login/page.tsx`)
- Registration Page (`/src/app/auth/register/page.tsx`)
- User Profile Page (`/src/app/profile/page.tsx`)
- User Management Page (Admin) (`/src/app/admin/users/page.tsx`)
- Auth Provider Component (`/src/providers/AuthProvider.tsx`)

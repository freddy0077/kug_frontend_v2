# Role-Based Access Control System Documentation

## Overview

The Dog Pedigree System implements a comprehensive role-based access control (RBAC) system to ensure that users have appropriate permissions based on their roles. This document outlines the roles, permissions, components, and implementation details of the RBAC system.

## User Roles

The system supports the following user roles:

1. **Admin**: Full system access with user management capabilities
2. **Owner**: Dog owners who manage their dogs' records
3. **Breeder**: Kennel operators who manage breeding programs
4. **Handler**: Professionals who handle dogs in competitions
5. **Club**: Kennel clubs that organize events and competitions

## Permission Structure

Permissions are defined along two dimensions:

1. **Entity Types**:
   - Dog
   - Health Record
   - Competition
   - Ownership
   - Breeding Program
   - Club Event
   - User

2. **Permission Types**:
   - View
   - Create
   - Edit
   - Delete

## Role-Based Permission Matrix

| Role    | Entity              | View | Create | Edit | Delete |
|---------|---------------------|------|--------|------|--------|
| Admin   | All entities        | ✅    | ✅      | ✅    | ✅      |
| Owner   | Dog (own)           | ✅    | ✅      | ✅    | ✅      |
| Owner   | Dog (others)        | ✅    | ❌      | ❌    | ❌      |
| Owner   | Health Record (own) | ✅    | ✅      | ✅    | ✅      |
| Breeder | Dog                 | ✅    | ✅      | ✅    | ✅      |
| Breeder | Breeding Program    | ✅    | ✅      | ✅    | ✅      |
| Handler | Competition         | ✅    | ✅      | ✅    | ❌      |
| Club    | Club Event          | ✅    | ✅      | ✅    | ✅      |

## Components

### 1. Permission Utilities (`permissionUtils.ts`)

The permission utility functions handle the core logic of the RBAC system:

- `hasPermission()`: Checks if a user has permission to perform a specific action on an entity
- `getPermittedActions()`: Returns all actions a user can perform on an entity
- `PermissionGate`: A React component that conditionally renders content based on permissions

Usage example:

```tsx
// Check if user can edit a dog
const canEdit = hasPermission(userRole, 'dog', 'edit', dogOwnerId, userId);

// Using the PermissionGate component
<PermissionGate 
  userRole={userRole} 
  entity="dog" 
  action="edit" 
  ownerId={dogOwnerId} 
  userId={userId}
>
  <EditButton onClick={handleEdit} />
</PermissionGate>
```

### 2. Role-Based Dashboard (`RoleBasedDashboard.tsx`)

The dashboard displays widgets and information specific to the user's role:

- Common widgets (My Dogs, Upcoming Events) shown to all users
- Role-specific widgets:
  - **Owner**: Health Records
  - **Handler**: Recent Competitions
  - **Breeder**: Active Litters, Planned Breedings
  - **Club**: Managed Events
  - **Admin**: User Management

### 3. Form Handlers (`formHandlers.ts`)

Form submission handlers for different entity types that include permission checks:

- `submitUserForm()`: For user management
- `submitDogForm()`: For dog registration/editing
- `submitHealthRecordForm()`: For health records
- `submitCompetitionResultForm()`: For competition results
- `submitOwnershipForm()`: For ownership transfers
- `submitBreedingProgramForm()`: For breeding programs
- `submitClubEventForm()`: For club events

Each handler verifies permissions before allowing the action.

### 4. Role-Specific Pages

- **Admin Dashboard** (`/admin/dashboard`): System overview and management tools
- **User Management** (`/admin/users`): User listing and management
- **Breeding Programs** (`/breeding-programs`): For breeders to manage breeding activities
- **Club Events** (`/club-events`): For clubs to manage events and competitions

## Implementation Details

### Authentication Flow

1. User logs in via `/auth/login`
2. Role is stored in localStorage as `userRole`
3. Authentication status stored as `isAuthenticated`
4. Subsequent requests check these values to determine permissions

### Navigation Control

The `Navbar.tsx` component conditionally renders navigation links based on the user's role:

```tsx
{isAuthenticated && userRole === 'admin' && (
  <Link href="/admin/dashboard">Admin Dashboard</Link>
)}

{isAuthenticated && (userRole === 'breeder' || userRole === 'admin') && (
  <Link href="/breeding-programs">Breeding Programs</Link>
)}
```

### Permission Checks in Components

All actions that modify data include permission checks:

```tsx
const handleDelete = async (id) => {
  if (!hasPermission(userRole, 'dog', 'delete', ownerId, userId)) {
    setError('You do not have permission to delete this record');
    return;
  }
  
  // Proceed with deletion
  try {
    await deleteDog(id);
    // Success handling
  } catch (error) {
    // Error handling
  }
};
```

## Consistent Field Naming

The system maintains consistent field naming across all components:

- Using `description` (not `diagnosis`) for health records
- Using `results` (not `test_results`) for health records
- Using `title_earned` (not `certificate`) for competition results
- Using `is_current` (not `is_active`) for ownerships

## Testing

The RBAC system includes comprehensive tests in `permissionTests.ts`:

- Permission matrix testing
- Role-based navigation testing
- Form submission testing with permission validation

Run tests with:

```bash
npm run test
```

## Future Enhancements

1. **JWT-Based Authentication**: Replace localStorage with secure JWT tokens
2. **Role Inheritance**: Implement hierarchical roles for more granular permissions
3. **Attribute-Based Access Control**: Extend RBAC with attribute-based permissions
4. **API-Level Authorization**: Add middleware for server-side permission checks

## Best Practices

1. **Always use permission checks** before performing data modifications
2. **Use the PermissionGate component** to conditionally render UI elements
3. **Test all permission matrices** when adding new features
4. **Consider both role and ownership** when checking permissions

---

For technical support or questions about the RBAC implementation, contact the development team.

Last updated: March 2025

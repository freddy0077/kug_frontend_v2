// Role-based permission utility functions

// Define permission types
export type Permission = 'view' | 'create' | 'edit' | 'delete';

// Define entity types
export type Entity = 'dog' | 'health-record' | 'competition' | 'ownership' | 'breeding-program' | 'club-event' | 'user' | 'pedigree';

// Define user roles to match GraphQL schema
export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  OWNER = 'OWNER',
  HANDLER = 'HANDLER',
  CLUB = 'CLUB',
  VIEWER = 'VIEWER'
}

// Helper to check if a role is in a list of roles
const hasRole = (userRole: UserRole, roles: UserRole[]): boolean => {
  return roles.includes(userRole);
}

/**
 * Checks if the user has permission to perform an action on a specific entity
 * @param userRole The role of the user
 * @param entity The entity type being acted upon
 * @param action The action being performed
 * @param ownerId The ID of the owner of the entity (if applicable)
 * @param userId The ID of the current user
 * @returns Boolean indicating whether the user has permission
 */
export const hasPermission = (
  userRole: UserRole,
  entity: Entity,
  action: Permission,
  ownerId?: string,
  userId?: string
): boolean => {
  // Super Admin and Admin have all permissions
  if (userRole === UserRole.SUPER_ADMIN || userRole === UserRole.ADMIN) {
    return true;
  }

  // Check if user is the owner of the entity (if ownerId is provided)
  const isOwner = Boolean(ownerId && userId && ownerId === userId);

  // Role-based permission matrix
  switch (entity) {
    case 'dog':
      switch (action) {
        case 'view':
          return true; // All users can view dogs
        case 'create':
          return hasRole(userRole, [UserRole.OWNER]);
        case 'edit':
          return isOwner || hasRole(userRole, [UserRole.OWNER]);
        case 'delete':
          return isOwner || userRole === UserRole.OWNER;
        default:
          return false;
      }

    case 'health-record':
      switch (action) {
        case 'view':
          return isOwner || hasRole(userRole, [UserRole.OWNER, UserRole.HANDLER]);
        case 'create':
          return hasRole(userRole, [UserRole.OWNER]);
        case 'edit':
          return isOwner || userRole === UserRole.OWNER;
        case 'delete':
          return isOwner || userRole === UserRole.OWNER;
        default:
          return false;
      }

    case 'competition':
      switch (action) {
        case 'view':
          return true; // All users can view competitions
        case 'create':
          return hasRole(userRole, [UserRole.OWNER, UserRole.HANDLER, UserRole.CLUB]);
        case 'edit':
          return isOwner || hasRole(userRole, [UserRole.HANDLER, UserRole.CLUB]);
        case 'delete':
          return isOwner || userRole === UserRole.CLUB;
        default:
          return false;
      }

    case 'ownership':
      switch (action) {
        case 'view':
          return isOwner || hasRole(userRole, [UserRole.OWNER, UserRole.CLUB]);
        case 'create':
          return hasRole(userRole, [UserRole.OWNER, UserRole.CLUB]);
        case 'edit':
          return isOwner || userRole === UserRole.CLUB;
        case 'delete':
          return userRole === UserRole.CLUB;
        default:
          return false;
      }

    case 'breeding-program':
      switch (action) {
        case 'view':
          return isOwner || hasRole(userRole, [UserRole.OWNER]);
        case 'create':
          return userRole === UserRole.OWNER;
        case 'edit':
          return isOwner && userRole === UserRole.OWNER;
        case 'delete':
          return isOwner && userRole === UserRole.OWNER;
        default:
          return false;
      }

    case 'club-event':
      switch (action) {
        case 'view':
          return true; // All users can view club events
        case 'create':
          return userRole === UserRole.CLUB;
        case 'edit':
          return isOwner && userRole === UserRole.CLUB;
        case 'delete':
          return isOwner && userRole === UserRole.CLUB;
        default:
          return false;
      }

    case 'user':
      switch (action) {
        case 'view':
          return isOwner || userRole.toString() === UserRole.ADMIN.toString();
        case 'create':
          return userRole.toString() === UserRole.ADMIN.toString();
        case 'edit':
          return isOwner || userRole.toString() === UserRole.ADMIN.toString();
        case 'delete':
          return userRole.toString() === UserRole.ADMIN.toString();
        default:
          return false;
      }

    case 'pedigree':
      switch (action) {
        case 'view':
          return true; // All users can view pedigrees
        case 'create':
          return hasRole(userRole, [UserRole.OWNER]);
        case 'edit':
          return isOwner || hasRole(userRole, [UserRole.OWNER]);
        case 'delete':
          return isOwner || userRole === UserRole.OWNER;
        default:
          return false;
      }
      
    default:
      return false;
  }
};

/**
 * Returns an array of actions the user is permitted to perform on an entity
 * @param userRole The role of the user
 * @param entity The entity type
 * @param ownerId The ID of the owner of the entity (if applicable)
 * @param userId The ID of the current user
 * @returns Array of permitted actions
 */
export const getPermittedActions = (
  userRole: UserRole,
  entity: Entity,
  ownerId?: string,
  userId?: string
): Permission[] => {
  const actions: Permission[] = ['view', 'create', 'edit', 'delete'];
  return actions.filter(action => 
    hasPermission(userRole, entity, action, ownerId, userId)
  );
};

/**
 * Component to conditionally render content based on user permissions
 * @param children React children components
 * @param userRole The role of the user
 * @param entity The entity type being acted upon
 * @param action The action being performed
 * @param ownerId The ID of the owner of the entity (if applicable)
 * @param userId The ID of the current user
 * @returns The children if the user has permission, otherwise null
 */
// We need to convert this file to .tsx if we want to use JSX syntax directly
// For now, let's create a function that doesn't use JSX but works with React components
export const checkPermission = ({
  userRole,
  entity,
  action,
  ownerId,
  userId
}: {
  userRole: UserRole;
  entity: Entity;
  action: Permission;
  ownerId?: string;
  userId?: string;
}): boolean => {
  return hasPermission(userRole, entity, action, ownerId, userId);
};

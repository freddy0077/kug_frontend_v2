// Role-based permission utility functions

// Define permission types
export type Permission = 'view' | 'create' | 'edit' | 'delete';

// Define entity types
export type Entity = 'dog' | 'health-record' | 'competition' | 'ownership' | 'breeding-program' | 'club-event' | 'user' | 'pedigree';

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
  userRole: string,
  entity: Entity,
  action: Permission,
  ownerId?: string,
  userId?: string
): boolean => {
  // Admin has all permissions
  if (userRole === 'admin') {
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
          return Boolean(['owner', 'breeder'].includes(userRole));
        case 'edit':
          return Boolean(isOwner || ['owner', 'breeder'].includes(userRole));
        case 'delete':
          return Boolean(isOwner || userRole === 'breeder');
        default:
          return false;
      }

    case 'health-record':
      switch (action) {
        case 'view':
          return Boolean(['owner', 'breeder', 'handler'].includes(userRole) || isOwner);
        case 'create':
          return Boolean(['owner', 'breeder'].includes(userRole));
        case 'edit':
          return Boolean(isOwner || userRole === 'breeder');
        case 'delete':
          return Boolean(isOwner || userRole === 'breeder');
        default:
          return false;
      }

    case 'competition':
      switch (action) {
        case 'view':
          return true; // All users can view competitions
        case 'create':
          return Boolean(['owner', 'handler', 'club'].includes(userRole));
        case 'edit':
          return Boolean(isOwner || ['handler', 'club'].includes(userRole));
        case 'delete':
          return Boolean(userRole === 'club' || isOwner);
        default:
          return false;
      }

    case 'ownership':
      switch (action) {
        case 'view':
          return Boolean(isOwner || ['owner', 'breeder', 'club'].includes(userRole));
        case 'create':
          return Boolean(['owner', 'breeder', 'club'].includes(userRole));
        case 'edit':
          return Boolean(userRole === 'club' || isOwner);
        case 'delete':
          return Boolean(userRole === 'club');
        default:
          return false;
      }

    case 'breeding-program':
      switch (action) {
        case 'view':
          return Boolean(['breeder', 'owner'].includes(userRole) || isOwner);
        case 'create':
          return Boolean(userRole === 'breeder');
        case 'edit':
          return Boolean(userRole === 'breeder' && isOwner);
        case 'delete':
          return Boolean(userRole === 'breeder' && isOwner);
        default:
          return false;
      }

    case 'club-event':
      switch (action) {
        case 'view':
          return true; // All users can view club events
        case 'create':
          return Boolean(userRole === 'club');
        case 'edit':
          return Boolean(userRole === 'club' && isOwner);
        case 'delete':
          return Boolean(userRole === 'club' && isOwner);
        default:
          return false;
      }

    case 'user':
      switch (action) {
        case 'view':
          return Boolean(userRole === 'admin' || isOwner);
        case 'create':
          return Boolean(userRole === 'admin');
        case 'edit':
          return Boolean(userRole === 'admin' || isOwner);
        case 'delete':
          return Boolean(userRole === 'admin');
        default:
          return false;
      }

    case 'pedigree':
      switch (action) {
        case 'view':
          return true; // All users can view pedigrees
        case 'create':
          return Boolean(['owner', 'breeder'].includes(userRole));
        case 'edit':
          return Boolean(isOwner || ['owner', 'breeder'].includes(userRole));
        case 'delete':
          return Boolean(isOwner || userRole === 'breeder');
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
  userRole: string,
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
  userRole: string;
  entity: Entity;
  action: Permission;
  ownerId?: string;
  userId?: string;
}): boolean => {
  return hasPermission(userRole, entity, action, ownerId, userId);
};

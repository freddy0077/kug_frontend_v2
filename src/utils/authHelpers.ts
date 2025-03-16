/**
 * Helper functions for authentication and authorization
 */

/**
 * Checks if a user is the owner of a dog or other entity
 * @param user The authenticated user
 * @param entity The entity (dog, litter, etc.) to check ownership for
 * @returns boolean True if the user is the owner, false otherwise
 */
export function checkOwnership(user: any, entity: any): boolean {
  // If user is admin, they have implicit ownership authority
  if (user.role === 'ADMIN') {
    return true;
  }
  
  // Check if user is an owner
  if (user.role !== 'OWNER' && user.role !== 'BREEDER') {
    return false;
  }
  
  // If the user has no owner record, they can't own anything
  if (!user.owner || !user.owner.id) {
    return false;
  }
  
  // Check if entity has a currentOwner property
  if (entity.currentOwner && entity.currentOwner.id === user.owner.id) {
    return true;
  }
  
  // Check if entity has an owner property
  if (entity.owner && entity.owner.id === user.owner.id) {
    return true;
  }
  
  // Check if entity has an ownerships array
  if (entity.ownerships && Array.isArray(entity.ownerships)) {
    // Look for a current ownership by this user
    return entity.ownerships.some(
      (ownership: any) => ownership.is_current && ownership.owner.id === user.owner.id
    );
  }
  
  return false;
}

/**
 * Checks if a user has a specific role
 * @param user The authenticated user
 * @param allowedRoles Array of allowed roles
 * @returns boolean True if the user has one of the allowed roles, false otherwise
 */
export function hasRole(user: any, allowedRoles: string[]): boolean {
  return user && user.role && allowedRoles.includes(user.role);
}

/**
 * Checks if a user is an admin
 * @param user The authenticated user
 * @returns boolean True if the user is an admin, false otherwise
 */
export function isAdmin(user: any): boolean {
  return user && user.role === 'ADMIN';
}

/**
 * Checks if a user is a breeder
 * @param user The authenticated user
 * @returns boolean True if the user is a breeder, false otherwise
 */
export function isBreeder(user: any): boolean {
  return user && (user.role === 'BREEDER' || user.role === 'ADMIN');
}

/**
 * Checks if a user is the owner of an entity or an admin
 * @param user The authenticated user
 * @param entity The entity to check ownership for
 * @returns boolean True if the user is the owner or an admin, false otherwise
 */
export function isOwnerOrAdmin(user: any, entity: any): boolean {
  return isAdmin(user) || checkOwnership(user, entity);
}

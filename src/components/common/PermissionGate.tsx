'use client';

import React from 'react';
import { Entity, Permission, checkPermission } from '@/utils/permissionUtils';

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
export const PermissionGate: React.FC<{
  children: React.ReactNode;
  userRole: string;
  entity: Entity;
  action: Permission;
  ownerId?: string;
  userId?: string;
}> = ({ children, userRole, entity, action, ownerId, userId }) => {
  if (checkPermission({ userRole, entity, action, ownerId, userId })) {
    return <>{children}</>;
  }
  return null;
};

export default PermissionGate;

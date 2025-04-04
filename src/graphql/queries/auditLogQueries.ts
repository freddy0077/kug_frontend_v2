import { gql } from '@apollo/client';

export const GET_AUDIT_LOGS = gql`
  query GetAuditLogs(
    $page: Int = 1
    $limit: Int = 20
    $entityType: String
    $action: AuditAction
  ) {
    auditLogs(
      page: $page
      limit: $limit
      entityType: $entityType
      action: $action
    ) {
      totalCount
      hasMore
      items {
        id
        timestamp
        action
        entityType
        entityId
        previousState
        newState
        ipAddress
        metadata
        userId
        user {
          id
          fullName
          email
        }
        createdAt
      }
    }
  }
`;

export const GET_AUDIT_LOG = gql`
  query GetAuditLog($id: ID!) {
    auditLog(id: $id) {
      id
      timestamp
      action
      entityType
      entityId
      previousState
      newState
      ipAddress
      metadata
      userId
      user {
        id
        fullName
        email
      }
      createdAt
      updatedAt
    }
  }
`;

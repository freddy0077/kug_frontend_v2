# Logs API

This document outlines the GraphQL API for system logs and audit trail management in the Dog Pedigree System. This API is primarily intended for administrative use.

## Types

### SystemLog

```graphql
type SystemLog {
  id: ID!
  timestamp: DateTime!
  level: LogLevel!
  message: String!
  source: String!
  details: String
  stackTrace: String
  ipAddress: String
  userId: ID
  user: User
  createdAt: DateTime!
}

enum LogLevel {
  DEBUG
  INFO
  WARNING
  ERROR
  CRITICAL
}

type AuditLog {
  id: ID!
  timestamp: DateTime!
  action: AuditAction!
  entityType: String!
  entityId: String!
  userId: ID!
  user: User!
  previousState: String
  newState: String
  ipAddress: String
  metadata: String
  createdAt: DateTime!
}

enum AuditAction {
  CREATE
  READ
  UPDATE
  DELETE
  LOGIN
  LOGOUT
  EXPORT
  IMPORT
  TRANSFER_OWNERSHIP
  APPROVE
  REJECT
}
```

## Queries

### getSystemLogs

Fetches a paginated list of system logs with optional filtering (admin-only).

```graphql
query getSystemLogs(
  $offset: Int = 0
  $limit: Int = 50
  $startDate: DateTime
  $endDate: DateTime
  $level: LogLevel
  $source: String
  $userId: ID
  $searchTerm: String
  $sortDirection: SortDirection = DESC
) {
  systemLogs(
    offset: $offset
    limit: $limit
    startDate: $startDate
    endDate: $endDate
    level: $level
    source: $source
    userId: $userId
    searchTerm: $searchTerm
    sortDirection: $sortDirection
  ) {
    totalCount
    hasMore
    items {
      id
      timestamp
      level
      message
      source
      details
      ipAddress
      userId
      user {
        id
        email
        fullName
      }
    }
  }
}
```

### getAuditLogs

Fetches a paginated list of audit logs with optional filtering (admin-only).

```graphql
query getAuditLogs(
  $offset: Int = 0
  $limit: Int = 50
  $startDate: DateTime
  $endDate: DateTime
  $action: AuditAction
  $entityType: String
  $entityId: String
  $userId: ID
  $sortDirection: SortDirection = DESC
) {
  auditLogs(
    offset: $offset
    limit: $limit
    startDate: $startDate
    endDate: $endDate
    action: $action
    entityType: $entityType
    entityId: $entityId
    userId: $userId
    sortDirection: $sortDirection
  ) {
    totalCount
    hasMore
    items {
      id
      timestamp
      action
      entityType
      entityId
      userId
      user {
        id
        email
        fullName
      }
      ipAddress
      metadata
    }
  }
}
```

### getEntityAuditTrail

Fetches the complete audit trail for a specific entity (admin-only).

```graphql
query getEntityAuditTrail(
  $entityType: String!
  $entityId: String!
  $includeDetails: Boolean = false
) {
  entityAuditTrail(
    entityType: $entityType
    entityId: $entityId
    includeDetails: $includeDetails
  ) {
    id
    timestamp
    action
    userId
    user {
      id
      email
      fullName
    }
    previousState @include(if: $includeDetails)
    newState @include(if: $includeDetails)
    metadata
  }
}
```

### getSystemLogById

Fetches detailed information about a specific system log entry (admin-only).

```graphql
query getSystemLogById($id: ID!) {
  systemLog(id: $id) {
    id
    timestamp
    level
    message
    source
    details
    stackTrace
    ipAddress
    userId
    user {
      id
      email
      fullName
      role
    }
    createdAt
  }
}
```

### getSystemStats

Fetches summary statistics of system logs (admin-only).

```graphql
query getSystemStats($days: Int = 7) {
  systemStats(days: $days) {
    totalLogs
    errorCount
    criticalCount
    logsByLevel {
      level
      count
    }
    logsBySource {
      source
      count
    }
    logsByDay {
      date
      count
      errorCount
    }
  }
}
```

## Mutations

### createSystemLog

Creates a new system log entry (typically used internally by the system).

```graphql
mutation createSystemLog($input: SystemLogInput!) {
  createSystemLog(input: $input) {
    id
    timestamp
    level
    message
  }
}

input SystemLogInput {
  level: LogLevel!
  message: String!
  source: String!
  details: String
  stackTrace: String
  ipAddress: String
  userId: ID
}
```

### createAuditLog

Creates a new audit log entry (typically used internally by the system).

```graphql
mutation createAuditLog($input: AuditLogInput!) {
  createAuditLog(input: $input) {
    id
    timestamp
    action
    entityType
    entityId
  }
}

input AuditLogInput {
  action: AuditAction!
  entityType: String!
  entityId: String!
  userId: ID!
  previousState: String
  newState: String
  ipAddress: String
  metadata: String
}
```

### clearLogs

Clears system logs older than a specific date (admin-only, requires confirmation).

```graphql
mutation clearLogs($input: ClearLogsInput!) {
  clearLogs(input: $input) {
    success
    message
    clearedCount
  }
}

input ClearLogsInput {
  olderThan: DateTime!
  logTypes: [String!]!  # "SYSTEM", "AUDIT", or both
  confirmation: String! # Must be "CONFIRM_CLEAR_LOGS"
}
```

### exportLogs

Exports logs to a downloadable format (admin-only).

```graphql
mutation exportLogs($input: ExportLogsInput!) {
  exportLogs(input: $input) {
    downloadUrl
    expiresAt
    fileFormat
    fileSize
  }
}

input ExportLogsInput {
  startDate: DateTime!
  endDate: DateTime!
  logTypes: [String!]!  # "SYSTEM", "AUDIT", or both
  format: ExportFormat! # "CSV", "JSON"
  filters: LogFilterInput
}

input LogFilterInput {
  level: LogLevel
  source: String
  action: AuditAction
  entityType: String
  userId: ID
}
```

## Error Handling

- `UNAUTHORIZED_ACCESS`: When non-admin user attempts to access logs
- `LOG_NOT_FOUND`: When requested log entry does not exist
- `INVALID_LOG_DATA`: When input data fails validation
- `INVALID_DATE_RANGE`: When date range is invalid
- `EXPORT_FAILED`: When log export operation fails
- `INVALID_CONFIRMATION`: When confirmation string doesn't match required value

## Frontend Components Using This API

- Admin Logs Dashboard (`/src/app/admin/logs/page.tsx`)
- System Statistics Component (`/src/components/admin/SystemStatistics.tsx`)
- Log Viewer Component (`/src/components/admin/LogViewer.tsx`)
- Entity Audit Trail Viewer (`/src/components/admin/EntityAuditTrail.tsx`)
- Log Export Tool (`/src/components/admin/LogExportTool.tsx`)

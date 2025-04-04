export enum AuditAction {
  CREATE = 'CREATE',
  READ = 'READ',
  UPDATE = 'UPDATE',
  DELETE = 'DELETE',
  LOGIN = 'LOGIN',
  LOGOUT = 'LOGOUT',
  EXPORT = 'EXPORT',
  IMPORT = 'IMPORT',
  TRANSFER_OWNERSHIP = 'TRANSFER_OWNERSHIP',
  APPROVE = 'APPROVE',
  REJECT = 'REJECT'
}

export interface User {
  id: string;
  fullName: string;
  email: string;
}

export interface AuditLogItem {
  id: string;
  timestamp: string;
  action: AuditAction;
  entityType: string;
  entityId: string;
  previousState?: string;
  newState?: string;
  ipAddress?: string;
  metadata?: string;
  userId?: string;
  user?: User;
  createdAt: string;
  updatedAt?: string;
}

export interface PaginatedAuditLogs {
  totalCount: number;
  hasMore: boolean;
  items: AuditLogItem[];
}

export interface AuditLogFilters {
  page: number;
  limit: number;
  entityType?: string;
  action?: AuditAction;
}

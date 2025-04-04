import { ReactNode } from 'react';

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  role: string;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  profileImageUrl?: string;
  location?: string;
}

export interface Tab {
  name: string;
  icon: ReactNode;
}

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  adminUsers: number;
  inactiveUsers: number;
  recentlyActive: number;
  percentActive: number;
}

export interface FilterOptions {
  searchTerm: string;
  roleFilter: string;
  statusFilter: boolean | null | '';
  sortField: string;
  sortDirection: 'asc' | 'desc';
}

export interface UserAction {
  id: string;
  action: 'activate' | 'deactivate';
}

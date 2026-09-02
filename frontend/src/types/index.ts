export type ThemeMode = 'system' | 'dark' | 'light';
export type UserRole = 'ADMIN' | 'DEVELOPER';
export type BugStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
export type BugSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
export type BugPriority = 'P0' | 'P1' | 'P2' | 'P3';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
}

export interface BugItem {
  id: string;
  title: string;
  status?: BugStatus;
  severity?: BugSeverity;
  priority?: BugPriority;
  category?: string;
  assignee?: string;
  assigneeId?: string;
  assignedToId?: string;
  rawDescription?: string;
  possibleCause?: string;
  suggestedFix?: string;
  createdAt?: string;
}

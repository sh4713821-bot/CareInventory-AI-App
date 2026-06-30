export type Role = 'supervisor' | 'staff' | 'donor' | 'manager';

export interface UserSession {
  name: string;
  role: Role;
  title: string;
  avatar: string;
}

export interface DonationItem {
  id: string;
  name: string;
  category: 'Medical & Nutrition' | 'Food' | 'Hygiene' | 'Clothing' | 'Educational';
  qty: number;
  unit: string;
  expiry: string;
  status: 'Optimal' | 'Critical' | 'Stock Low';
  trackingStatus?: 'Pending' | 'Received' | 'Sorted' | 'Dispatched';
  donorName?: string;
  description?: string;
}

export interface ChildNeed {
  id: string;
  title: string;
  priority: 'High' | 'Med' | 'Urgent';
  age?: string;
  quantity?: number;
  season?: string;
  matchingStatus: 'Match Found' | 'Searching' | 'Needs Procurement';
  statusDetails: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  event: string;
  entity: string;
  status: 'Completed' | 'In Transit' | 'Verified';
  verified: boolean;
}

export interface InventoryStockItem {
  id: string;
  name: string;
  category: 'Medical & Nutrition' | 'Food' | 'Hygiene' | 'Clothing' | 'Educational';
  qty: number;
  unit: string;
}

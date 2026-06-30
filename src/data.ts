import { DonationItem, ChildNeed, AuditLog } from './types';

export const INITIAL_DONATIONS: DonationItem[] = [
  {
    id: '#REG-3542',
    name: 'Thermal Blankets & Winter Jackets Pack',
    category: 'Clothing',
    qty: 15,
    unit: 'Packs',
    expiry: '2026-12-31',
    status: 'Optimal',
    trackingStatus: 'Received',
    donorName: 'Alexander Reed'
  },
  {
    id: '#INF-9283',
    name: 'Baby Formula (Stage 1)',
    category: 'Medical & Nutrition',
    qty: 240,
    unit: 'Units',
    expiry: '2024-12-15',
    status: 'Optimal'
  },
  {
    id: '#DAI-1022',
    name: 'UHT Whole Milk (1L)',
    category: 'Food',
    qty: 48,
    unit: 'Units',
    expiry: '2024-05-20',
    status: 'Critical'
  },
  {
    id: '#HYG-4451',
    name: 'Hygiene Kits (Type A)',
    category: 'Hygiene',
    qty: 156,
    unit: 'Units',
    expiry: '2026-01-01',
    status: 'Optimal'
  },
  {
    id: '#GRA-8821',
    name: 'Rice (5kg Sacks)',
    category: 'Food',
    qty: 85,
    unit: 'Units',
    expiry: '2025-08-12',
    status: 'Stock Low'
  }
];

export const INITIAL_NEEDS: ChildNeed[] = [
  {
    id: '#NEED-001',
    title: '10 packs of baby formula',
    priority: 'High',
    age: '0-12m',
    matchingStatus: 'Match Found',
    statusDetails: '240 units available in Donation Vault.'
  },
  {
    id: '#NEED-002',
    title: 'Winter coats age 5-8',
    priority: 'Med',
    season: 'Winter',
    matchingStatus: 'Searching',
    statusDetails: 'Contacting regional partners for surplus items.'
  },
  {
    id: '#NEED-003',
    title: 'Emergency First Aid Kits',
    priority: 'Urgent',
    quantity: 5,
    matchingStatus: 'Needs Procurement',
    statusDetails: 'Procure Now'
  }
];

export const INITIAL_LOGS: AuditLog[] = [
  {
    id: 'LOG-001',
    timestamp: 'Jun 24, 2024 • 14:20',
    event: 'Vaccine Batch Distributed',
    entity: 'Hope Village Clinic',
    status: 'Completed',
    verified: true
  },
  {
    id: 'LOG-002',
    timestamp: 'Jun 24, 2024 • 09:15',
    event: 'Bulk Grain Donation Received',
    entity: 'Global Ag Corp',
    status: 'In Transit',
    verified: false
  },
  {
    id: 'LOG-003',
    timestamp: 'Jun 23, 2024 • 17:45',
    event: 'New Child Registry Impact',
    entity: 'Sector 7 Shelter',
    status: 'Verified',
    verified: true
  }
];

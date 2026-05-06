export type UnitStatus = 'vacant' | 'occupied' | 'under_maintenance';

export interface Unit {
  id: string;
  property_id: string;
  unit_number: string;
  rent_amount: number;
  maintenance_charge: number;
  status: UnitStatus;
  tenant_id: string | null;
  tenant_name: string | null;
  lease_start: string | null;
  lease_end: string | null;
  agreement_generated: boolean;
  last_payment_status: 'paid' | 'pending' | 'failed' | 'overdue' | null;
}

export const units: Unit[] = [
  // ── Prestige Towers (property_id: p1) ──
  {
    id: 'u-p1-101',
    property_id: 'p1',
    unit_number: 'A-101',
    rent_amount: 20000,
    maintenance_charge: 1500,
    status: 'occupied',
    tenant_id: 't2',
    tenant_name: 'Priya Sharma',
    lease_start: '2024-04-01',
    lease_end: '2027-03-31',
    agreement_generated: true,
    last_payment_status: 'failed',
  },
  {
    id: 'u-p1-204',
    property_id: 'p1',
    unit_number: 'B-204',
    rent_amount: 22000,
    maintenance_charge: 1800,
    status: 'occupied',
    tenant_id: 't1',
    tenant_name: 'Arjun Mehta',
    lease_start: '2025-01-01',
    lease_end: '2026-12-31',
    agreement_generated: true,
    last_payment_status: 'paid',
  },
  {
    id: 'u-p1-302',
    property_id: 'p1',
    unit_number: 'C-302',
    rent_amount: 24000,
    maintenance_charge: 2000,
    status: 'occupied',
    tenant_id: 't3',
    tenant_name: 'Rahul Nair',
    lease_start: '2023-07-01',
    lease_end: '2026-06-30',
    agreement_generated: true,
    last_payment_status: 'paid',
  },
  {
    id: 'u-p1-105',
    property_id: 'p1',
    unit_number: 'D-105',
    rent_amount: 22000,
    maintenance_charge: 1800,
    status: 'occupied',
    tenant_id: 't4',
    tenant_name: 'Sneha Iyer',
    lease_start: '2024-10-01',
    lease_end: '2026-09-30',
    agreement_generated: true,
    last_payment_status: 'paid',
  },
  // ── Green Valley Flats (property_id: p2) ──
  {
    id: 'u-p2-203',
    property_id: 'p2',
    unit_number: 'A-203',
    rent_amount: 18000,
    maintenance_charge: 1200,
    status: 'occupied',
    tenant_id: 't5',
    tenant_name: 'Vikram Singh',
    lease_start: '2024-12-01',
    lease_end: '2026-11-30',
    agreement_generated: true,
    last_payment_status: 'paid',
  },
  {
    id: 'u-p2-205',
    property_id: 'p2',
    unit_number: 'B-205',
    rent_amount: 20000,
    maintenance_charge: 1200,
    status: 'vacant',
    tenant_id: null,
    tenant_name: null,
    lease_start: null,
    lease_end: null,
    agreement_generated: false,
    last_payment_status: null,
  },
];

export function getUnitsByProperty(propertyId: string): Unit[] {
  return units.filter((u) => u.property_id === propertyId);
}

export function getOccupiedUnits(propertyId: string): Unit[] {
  return units.filter((u) => u.property_id === propertyId && u.status === 'occupied');
}

export function getVacantUnits(propertyId: string): Unit[] {
  return units.filter((u) => u.property_id === propertyId && u.status === 'vacant');
}

export function getPropertyRentTotal(propertyId: string): number {
  return units
    .filter((u) => u.property_id === propertyId && u.status === 'occupied')
    .reduce((sum, u) => sum + u.rent_amount, 0);
}

export function getPropertyMaintenanceTotal(propertyId: string): number {
  return units
    .filter((u) => u.property_id === propertyId)
    .reduce((sum, u) => sum + u.maintenance_charge, 0);
}
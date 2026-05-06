export interface QRAnalytics {
  listingId: string;
  scans: number;
  conversions: number;
  lastScanAt: string;
  dailyScans: { date: string; count: number }[];
}

export const qrAnalytics: QRAnalytics[] = [
  {
    listingId: '3',
    scans: 47,
    conversions: 8,
    lastScanAt: '2026-04-27T14:30:00Z',
    dailyScans: [
      { date: '2026-04-21', count: 3 },
      { date: '2026-04-22', count: 5 },
      { date: '2026-04-23', count: 2 },
      { date: '2026-04-24', count: 7 },
      { date: '2026-04-25', count: 4 },
      { date: '2026-04-26', count: 6 },
      { date: '2026-04-27', count: 8 },
    ],
  },
  {
    listingId: '6',
    scans: 23,
    conversions: 3,
    lastScanAt: '2026-04-26T09:15:00Z',
    dailyScans: [
      { date: '2026-04-21', count: 1 },
      { date: '2026-04-22', count: 2 },
      { date: '2026-04-23', count: 1 },
      { date: '2026-04-24', count: 4 },
      { date: '2026-04-25', count: 3 },
      { date: '2026-04-26', count: 5 },
      { date: '2026-04-27', count: 2 },
    ],
  },
];
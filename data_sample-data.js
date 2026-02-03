// Sample demo data for initial load - can be removed in production
const SAMPLE_RENTERS = [
  {
    id: 'r1',
    name: 'Ahsan Khan',
    contact: '9876543210',
    property: 'Flat A - 101',
    monthlyRent: 12000,
    advance: 24000,
    dueDay: 5,
    notes: 'Pays on time usually',
    payments: [
      { id: 'p1', amount: 12000, date: '2026-01-05', type: 'rent' },
      { id: 'p2', amount: 12000, date: '2026-02-05', type: 'rent' }
    ]
  },
  {
    id: 'r2',
    name: 'Zara Mir',
    contact: '9123456780',
    property: 'Flat B - 202',
    monthlyRent: 15000,
    advance: 0,
    dueDay: 3,
    notes: 'Often late',
    payments: [
      { id: 'p3', amount: 15000, date: '2025-12-10', type: 'rent' }
    ]
  }
];

const SAMPLE_INSTALLMENTS = [
  {
    id: 'i1',
    name: 'Bilal Traders',
    contact: '9000001111',
    item: 'Fridge Model X',
    totalPrice: 40000,
    advance: 10000,
    durationMonths: 6,
    payments: [
      { id: 'ip1', amount: 5000, date: '2026-01-10' }
    ]
  }
];
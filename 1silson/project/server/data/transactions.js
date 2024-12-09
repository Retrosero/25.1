export const transactions = [
  {
    id: 'T001',
    date: '2024-03-10T10:00:00Z',
    type: 'sale',
    customer: {
      id: 'C001',
      name: 'Ahmet Er Market'
    },
    amount: 1500,
    description: 'Market alışverişi'
  },
  {
    id: 'T002',
    date: '2024-03-11T14:30:00Z',
    type: 'payment',
    customer: {
      id: 'C001',
      name: 'Ahmet Er Market'
    },
    amount: 1000,
    description: 'Nakit ödeme'
  },
  {
    id: 'T003',
    date: '2024-03-12T09:15:00Z',
    type: 'sale',
    customer: {
      id: 'C002',
      name: 'Mehmet Yılmaz Bakkaliyesi'
    },
    amount: 2500,
    description: 'Toptan alım'
  }
];
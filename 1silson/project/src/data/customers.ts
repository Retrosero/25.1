export interface Customer {
  id: string;
  name: string;
  taxNumber: string;
  balance: number;
  creditLimit: number;
  address: string;
  phone: string;
  email: string;
  region?: string;
  latitude?: string;
  longitude?: string;
}

export const customers: Customer[] = [
  {
    id: 'C001',
    name: 'Ahmet Er Market',
    taxNumber: '1234567890',
    balance: 12500,
    creditLimit: 50000,
    address: 'Atatürk Cad. No:123 İstanbul',
    phone: '0532 123 4567',
    email: 'ahmet@ermarket.com',
    region: 'Kadıköy',
  },
  {
    id: 'C002',
    name: 'Mehmet Yılmaz Bakkaliyesi',
    taxNumber: '9876543210',
    balance: 8750,
    creditLimit: 30000,
    address: 'İnönü Sok. No:45 İstanbul',
    phone: '0532 456 7890',
    email: 'mehmet@yilmazbakkal.com',
    region: 'Beşiktaş',
  },
  {
    id: 'C003',
    name: 'Ayşe Demir Şarküteri',
    taxNumber: '4567891230',
    balance: 15000,
    creditLimit: 40000,
    address: 'Cumhuriyet Mah. 123. Sok. No:7 İstanbul',
    phone: '0532 789 0123',
    email: 'ayse@demirsarkuteri.com',
    region: 'Şişli',
  },
  {
    id: 'C004',
    name: 'Can Bakkal',
    taxNumber: '7891234560',
    balance: 5000,
    creditLimit: 20000,
    address: 'Bahçelievler Mah. 34. Sok. No:12 İstanbul',
    phone: '0533 234 5678',
    email: 'can@bakkal.com',
    region: 'Bahçelievler',
  },
  {
    id: 'C005',
    name: 'Zeynep Market',
    taxNumber: '3216549870',
    balance: 18000,
    creditLimit: 45000,
    address: 'Göztepe Mah. 56. Sok. No:23 İstanbul',
    phone: '0535 345 6789',
    email: 'zeynep@market.com',
    region: 'Göztepe',
  }
];
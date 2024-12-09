import { useState } from 'react';
import { Search, Filter, Printer, Eye } from 'lucide-react';
import { formatCurrency } from '../lib/utils';
import { TransactionPreview } from '../components/daily-report/transaction-preview';
import { useTransactions } from '../hooks/use-transactions';

export function DailyReportPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedType, setSelectedType] = useState<'all' | 'sales' | 'payments' | 'expenses' | 'returns'>('all');
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const { transactions } = useTransactions();

  const filteredTransactions = transactions
    .filter(transaction => transaction.date.split('T')[0] === selectedDate)
    .filter(transaction => {
      if (selectedType === 'all') return true;
      switch (selectedType) {
        case 'sales':
          return transaction.type === 'sale';
        case 'payments':
          return transaction.type === 'payment';
        case 'expenses':
          return transaction.type === 'expense';
        case 'returns':
          return transaction.type === 'return';
        default:
          return true;
      }
    })
    .filter(transaction =>
      transaction.customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      transaction.id.toLowerCase().includes(searchQuery.toLowerCase())
    );

  // Calculate totals for the selected date
  const totals = transactions
    .filter(transaction => transaction.date.split('T')[0] === selectedDate)
    .reduce(
      (acc, transaction) => {
        const amount = Math.abs(transaction.amount);
        switch (transaction.type) {
          case 'sale':
            acc.sales += amount;
            break;
          case 'payment':
            acc.payments += amount;
            break;
          case 'expense':
            acc.expenses += amount;
            break;
          case 'return':
            acc.returns += amount;
            break;
        }
        return acc;
      },
      { sales: 0, payments: 0, expenses: 0, returns: 0 }
    );

  const getTransactionTypeText = (type: string) => {
    switch (type) {
      case 'sale':
        return 'Satış Faturası';
      case 'payment':
        return 'Tahsilat';
      case 'expense':
        return 'Tediye';
      case 'return':
        return 'İade';
      default:
        return type;
    }
  };

  const handleTransactionClick = (transaction: any) => {
    setSelectedTransaction(transaction);
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Gün Sonu Raporu</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500">Toplam Satış</p>
          <p className="text-responsive font-bold">{formatCurrency(totals.sales)}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500">Toplam Tahsilat</p>
          <p className="text-responsive font-bold">{formatCurrency(totals.payments)}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500">Toplam Tediye</p>
          <p className="text-responsive font-bold">{formatCurrency(totals.expenses)}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500">Toplam İade</p>
          <p className="text-responsive font-bold">{formatCurrency(totals.returns)}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="İşlem ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 h-10 rounded-lg border border-gray-200 dark:border-gray-700"
          />
        </div>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="w-48 px-4 h-10 rounded-lg border border-gray-200 dark:border-gray-700"
        />
      </div>

      <div className="flex gap-4 mb-6 overflow-x-auto py-2">
        {(['all', 'sales', 'payments', 'expenses', 'returns'] as const).map((type) => (
          <button
            key={type}
            onClick={() => setSelectedType(type)}
            className={`px-4 py-2 rounded-lg whitespace-nowrap ${
              selectedType === type
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700'
            }`}
          >
            {type === 'all' ? 'Tümü' :
             type === 'sales' ? 'Satışlar' :
             type === 'payments' ? 'Tahsilatlar' :
             type === 'expenses' ? 'Tediyeler' : 'İadeler'}
          </button>
        ))}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left p-4">İşlem No</th>
                <th className="text-left p-4">Tarih</th>
                <th className="text-left p-4">İşlem Türü</th>
                <th className="text-left p-4">Müşteri</th>
                <th className="text-right p-4">Tutar</th>
                <th className="text-center p-4">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map((transaction) => (
                <tr 
                  key={transaction.id} 
                  onClick={() => handleTransactionClick(transaction)}
                  className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                >
                  <td className="p-4">{transaction.id}</td>
                  <td className="p-4">{new Date(transaction.date).toLocaleString('tr-TR')}</td>
                  <td className="p-4">{getTransactionTypeText(transaction.type)}</td>
                  <td className="p-4">
                    <div>
                      <p className="font-medium">{transaction.customer.name}</p>
                      <p className="text-sm text-gray-500">{transaction.customer.phone}</p>
                    </div>
                  </td>
                  <td className="p-4 text-right">{formatCurrency(Math.abs(transaction.amount))}</td>
                  <td className="p-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTransactionClick(transaction);
                        }}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                        title="Görüntüle"
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedTransaction && (
        <TransactionPreview
          transaction={selectedTransaction}
          onClose={() => setSelectedTransaction(null)}
          onPrint={() => {
            const printContent = document.getElementById('transaction-content');
            if (!printContent) return;

            const printWindow = window.open('', '_blank');
            if (!printWindow) return;

            printWindow.document.write(`
              <html>
                <head>
                  <title>İşlem Detayı</title>
                  <style>
                    body { font-family: system-ui, -apple-system, sans-serif; }
                    table { width: 100%; border-collapse: collapse; }
                    th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
                    @media print {
                      .no-print { display: none; }
                    }
                  </style>
                </head>
                <body>
                  ${printContent.innerHTML}
                </body>
              </html>
            `);
            printWindow.document.close();
            printWindow.print();
          }}
        />
      )}
    </div>
  );
}
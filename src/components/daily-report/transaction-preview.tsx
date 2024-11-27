import { X, Printer } from 'lucide-react';
import { formatCurrency } from '../../lib/utils';

type TransactionPreviewProps = {
  transaction: {
    id: string;
    date: string;
    type: 'sale' | 'payment' | 'expense';
    description: string;
    customer: {
      id: string;
      name: string;
      taxNumber: string;
      address: string;
      phone: string;
    };
    amount: number;
    items?: Array<{ name: string; quantity: number; price: number }>;
    paymentMethod?: string;
    note?: string;
  };
  onClose: () => void;
  onPrint: () => void;
};

export function TransactionPreview({ transaction, onClose, onPrint }: TransactionPreviewProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-3xl">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-bold">
            {transaction.type === 'sale' ? 'Satış Faturası' : 
             transaction.type === 'payment' ? 'Tahsilat Makbuzu' : 
             'Tediye Makbuzu'}
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={onPrint}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              <Printer className="w-5 h-5" />
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <div id="transaction-content" className="p-6 space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium mb-2">Müşteri Bilgileri</h3>
              <p className="font-medium">{transaction.customer.name}</p>
              <p className="text-sm text-gray-500">{transaction.customer.address}</p>
              <p className="text-sm text-gray-500">Tel: {transaction.customer.phone}</p>
              <p className="text-sm text-gray-500">VKN: {transaction.customer.taxNumber}</p>
            </div>
            <div className="text-right">
              <h3 className="font-medium mb-2">İşlem Bilgileri</h3>
              <p className="text-sm text-gray-500">Tarih</p>
              <p className="font-medium">{new Date(transaction.date).toLocaleString('tr-TR')}</p>
              <p className="text-sm text-gray-500 mt-2">İşlem No</p>
              <p className="font-medium">{transaction.id}</p>
            </div>
          </div>

          {transaction.type === 'sale' && transaction.items && (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-2">Ürün</th>
                  <th className="text-right py-2">Birim Fiyat</th>
                  <th className="text-right py-2">Miktar</th>
                  <th className="text-right py-2">Toplam</th>
                </tr>
              </thead>
              <tbody>
                {transaction.items.map((item, index) => (
                  <tr key={index} className="border-b border-gray-200 dark:border-gray-700">
                    <td className="py-2">{item.name}</td>
                    <td className="text-right">{formatCurrency(item.price)}</td>
                    <td className="text-right">{item.quantity}</td>
                    <td className="text-right">{formatCurrency(item.price * item.quantity)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="font-bold">
                  <td colSpan={3} className="text-right py-2">Toplam</td>
                  <td className="text-right">{formatCurrency(Math.abs(transaction.amount))}</td>
                </tr>
              </tfoot>
            </table>
          )}

          {(transaction.type === 'payment' || transaction.type === 'expense') && (
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                <span className="font-medium">Ödeme Yöntemi</span>
                <span>{transaction.paymentMethod}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-200 dark:border-gray-700">
                <span className="font-medium">Tutar</span>
                <span className="text-xl font-bold">
                  {formatCurrency(Math.abs(transaction.amount))}
                </span>
              </div>
            </div>
          )}

          {transaction.note && (
            <div>
              <h3 className="font-medium mb-2">Not</h3>
              <p className="text-sm text-gray-500">{transaction.note}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
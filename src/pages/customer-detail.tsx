import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Phone, MapPin, Plus, CreditCard, ArrowLeft, Search, Download, MessageSquare } from 'lucide-react';
import { useCustomers } from '../hooks/use-customers';
import { useTransactions } from '../hooks/use-transactions';
import { useOrders } from '../hooks/use-orders';
import { formatCurrency } from '../lib/utils';
import { cn } from '../lib/utils';
import { ExportMenu } from '../components/export-menu';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { TransactionPreview } from '../components/daily-report/transaction-preview';

type TabType = 'transactions' | 'orders' | 'products' | 'returns' | 'settings';

export function CustomerDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { customers } = useCustomers();
  const { getCustomerTransactions, getCustomerStats, getCustomerBalance } = useTransactions();
  const { getOrdersByCustomer } = useOrders();
  const [activeTab, setActiveTab] = useState<TabType>('transactions');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);

  const customer = customers.find(c => c.id === id);
  if (!customer) return null;

  const customerTransactions = getCustomerTransactions(customer.id, selectedYear);
  const customerOrders = getOrdersByCustomer(customer.id);
  const balance = getCustomerBalance(customer.id);
  const stats = getCustomerStats(customer.id);

  const handleExport = async (format: 'excel' | 'pdf' | 'png') => {
    const content = document.getElementById('transactions-table');
    if (!content) return;

    switch (format) {
      case 'excel':
        const data = customerTransactions.map(t => ({
          'Tarih': new Date(t.date).toLocaleDateString('tr-TR'),
          'İşlem': t.type === 'sale' ? 'Satış' :
                   t.type === 'payment' ? 'Tahsilat' :
                   t.type === 'return' ? 'İade' : 'Tediye',
          'Açıklama': t.description,
          'Tutar': formatCurrency(Math.abs(t.amount))
        }));

        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Hesap Hareketleri');
        XLSX.writeFile(wb, `hesap-hareketleri-${customer.name}.xlsx`);
        break;

      case 'pdf':
        const pdf = new jsPDF();
        const canvas = await html2canvas(content);
        const imgData = canvas.toDataURL('image/png');
        pdf.addImage(imgData, 'PNG', 10, 10, 190, 0);
        pdf.save(`hesap-hareketleri-${customer.name}.pdf`);
        break;

      case 'png':
        const canvas2 = await html2canvas(content);
        const link = document.createElement('a');
        link.download = `hesap-hareketleri-${customer.name}.png`;
        link.href = canvas2.toDataURL();
        link.click();
        break;
    }
  };

  const handleWhatsAppShare = () => {
    let message = `Hesap Hareketleri - ${customer.name}\n\n`;
    customerTransactions.forEach(t => {
      message += `${new Date(t.date).toLocaleDateString('tr-TR')} - ${formatCurrency(t.amount)}\n`;
    });
    
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${customer.phone.replace(/\D/g, '')}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="px-4 py-6">
          <button
            onClick={() => navigate('/customers')}
            className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Müşteriler</span>
          </button>

          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{customer.name}</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">#{customer.taxNumber}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => navigate('/sales')}
                className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                <Plus className="w-4 h-4" />
                <span>Satış</span>
              </button>
              <button
                onClick={() => navigate('/payments')}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <CreditCard className="w-4 h-4" />
                <span>Tahsilat</span>
              </button>
            </div>
          </div>

          <div className="mt-4 space-y-2">
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
              <Phone className="w-4 h-4" />
              <span>{customer.phone}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
              <MapPin className="w-4 h-4" />
              <span>{customer.address}</span>
            </div>
          </div>

          <div className="mt-6">
            <p className="text-sm text-gray-500 dark:text-gray-400">Bakiye</p>
            <p className={`text-2xl font-bold ${balance >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {formatCurrency(balance)}
            </p>
          </div>
        </div>

        <div className="px-4">
          <div className="flex gap-4 border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setActiveTab('transactions')}
              className={cn(
                'px-4 py-2 font-medium',
                activeTab === 'transactions'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-500 dark:text-gray-400'
              )}
            >
              Hesap Hareketleri
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={cn(
                'px-4 py-2 font-medium',
                activeTab === 'orders'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-500 dark:text-gray-400'
              )}
            >
              Siparişler
            </button>
            <button
              onClick={() => setActiveTab('products')}
              className={cn(
                'px-4 py-2 font-medium',
                activeTab === 'products'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-500 dark:text-gray-400'
              )}
            >
              Satılanlar
            </button>
            <button
              onClick={() => setActiveTab('returns')}
              className={cn(
                'px-4 py-2 font-medium',
                activeTab === 'returns'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-500 dark:text-gray-400'
              )}
            >
              İadeler
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={cn(
                'px-4 py-2 font-medium',
                activeTab === 'settings'
                  ? 'text-primary-600 border-b-2 border-primary-600'
                  : 'text-gray-500 dark:text-gray-400'
              )}
            >
              Ayarlar
            </button>
          </div>
        </div>
      </div>

      <div className="p-4">
        {activeTab === 'transactions' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700"
                >
                  {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
                <div className="flex gap-2">
                  <ExportMenu onExport={handleExport} />
                  <button
                    onClick={handleWhatsAppShare}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    <MessageSquare className="w-4 h-4" />
                    WhatsApp
                  </button>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto" id="transactions-table">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left p-4">Tarih</th>
                    <th className="text-left p-4">İşlem</th>
                    <th className="text-left p-4">Seri</th>
                    <th className="text-left p-4">Sıra</th>
                    <th className="text-left p-4">Açıklama</th>
                    <th className="text-right p-4">Tutar</th>
                    <th className="text-right p-4">Bakiye</th>
                  </tr>
                </thead>
                <tbody>
                  {customerTransactions.map((transaction) => (
                    <tr 
                      key={transaction.id}
                      onClick={() => setSelectedTransaction(transaction)}
                      className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                    >
                      <td className="p-4">{new Date(transaction.date).toLocaleDateString('tr-TR')}</td>
                      <td className="p-4">
                        {transaction.type === 'sale' ? 'Satış' :
                         transaction.type === 'payment' ? 'Tahsilat' :
                         transaction.type === 'return' ? 'İade' : 'Tediye'}
                      </td>
                      <td className="p-4">{transaction.series || '-'}</td>
                      <td className="p-4">{transaction.sequence}</td>
                      <td className="p-4">{transaction.description}</td>
                      <td className="p-4 text-right">{formatCurrency(Math.abs(transaction.amount))}</td>
                      <td className="p-4 text-right">{formatCurrency(transaction.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left p-4">Sipariş No</th>
                    <th className="text-left p-4">Tarih</th>
                    <th className="text-center p-4">Durum</th>
                    <th className="text-right p-4">Tutar</th>
                  </tr>
                </thead>
                <tbody>
                  {customerOrders.map((order) => (
                    <tr 
                      key={order.id}
                      onClick={() => setSelectedTransaction({
                        ...order,
                        type: 'sale',
                        description: 'Satış',
                        amount: order.totalAmount,
                        items: order.items
                      })}
                      className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                    >
                      <td className="p-4">{order.id}</td>
                      <td className="p-4">{new Date(order.date).toLocaleDateString('tr-TR')}</td>
                      <td className="p-4 text-center">
                        <span className={cn(
                          'px-2 py-0.5 text-xs rounded-full',
                          order.status === 'preparing' ? 'bg-yellow-100 text-yellow-800' :
                          order.status === 'checking' ? 'bg-blue-100 text-blue-800' :
                          order.status === 'loading' ? 'bg-purple-100 text-purple-800' :
                          order.status === 'ready' ? 'bg-orange-100 text-orange-800' :
                          'bg-green-100 text-green-800'
                        )}>
                          {order.status === 'preparing' ? 'Hazırlanıyor' :
                           order.status === 'checking' ? 'Kontrol Ediliyor' :
                           order.status === 'loading' ? 'Yükleniyor' :
                           order.status === 'ready' ? 'Teslime Hazır' :
                           'Teslim Edildi'}
                        </span>
                      </td>
                      <td className="p-4 text-right">{formatCurrency(order.totalAmount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'products' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Ürün ara (kod veya isim)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 h-10 rounded-lg border border-gray-200 dark:border-gray-700"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left p-4">Ürün</th>
                    <th className="text-right p-4">Birim Fiyat</th>
                    <th className="text-right p-4">Miktar</th>
                    <th className="text-right p-4">Toplam</th>
                  </tr>
                </thead>
                <tbody>
                  {customerTransactions
                    .filter(t => t.type === 'sale' && t.items)
                    .flatMap(t => t.items || [])
                    .reduce((acc, item) => {
                      const existing = acc.find(p => p.productId === item.productId);
                      if (existing) {
                        existing.quantity += item.quantity;
                        existing.total += item.price * item.quantity;
                      } else {
                        acc.push({
                          productId: item.productId,
                          name: item.name,
                          quantity: item.quantity,
                          price: item.price,
                          total: item.price * item.quantity
                        });
                      }
                      return acc;
                    }, [] as Array<{
                      productId: string;
                      name: string;
                      quantity: number;
                      price: number;
                      total: number;
                    }>)
                    .filter(product =>
                      !searchQuery ||
                      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      product.productId.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    .map((product) => (
                      <tr key={product.productId} className="border-b border-gray-200 dark:border-gray-700">
                        <td className="p-4">{product.name}</td>
                        <td className="p-4 text-right">{formatCurrency(product.price)}</td>
                        <td className="p-4 text-right">{product.quantity}</td>
                        <td className="p-4 text-right">{formatCurrency(product.total)}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'returns' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left p-4">İade No</th>
                    <th className="text-left p-4">Tarih</th>
                    <th className="text-left p-4">Açıklama</th>
                    <th className="text-right p-4">Tutar</th>
                  </tr>
                </thead>
                <tbody>
                  {customerTransactions
                    .filter(t => t.type === 'return')
                    .map((transaction) => (
                      <tr 
                        key={transaction.id}
                        onClick={() => setSelectedTransaction(transaction)}
                        className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                      >
                        <td className="p-4">{transaction.id}</td>
                        <td className="p-4">{new Date(transaction.date).toLocaleDateString('tr-TR')}</td>
                        <td className="p-4">{transaction.description}</td>
                        <td className="p-4 text-right">{formatCurrency(Math.abs(transaction.amount))}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-lg font-semibold mb-4">Müşteri Ayarları</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Bölge</label>
                <input
                  type="text"
                  value={customer.region || ''}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700"
                  placeholder="Müşterinin bulunduğu bölge"
                  readOnly
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Konum</label>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-500 mb-1">Enlem</label>
                    <input
                      type="text"
                      value={customer.latitude || ''}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700"
                      placeholder="41.0082"
                      readOnly
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-500 mb-1">Boylam</label>
                    <input
                      type="text"
                      value={customer.longitude || ''}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700"
                      placeholder="28.9784"
                      readOnly
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Kredi Limiti</label>
                <input
                  type="text"
                  value={formatCurrency(customer.creditLimit)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700"
                  readOnly
                />
              </div>
            </div>
          </div>
        )}

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
    </div>
  );
}
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Phone, MapPin, Plus, CreditCard, ArrowLeft, Search, MessageSquare } from 'lucide-react';
import { fetchCustomerTransactions } from '../lib/api';
import { getCustomerById } from '../lib/db/customer';
import { syncCustomers } from '../lib/db/sync';
import { useQuery } from '@tanstack/react-query';
import { useOrders } from '../hooks/use-orders';
import { formatCurrency } from '../lib/utils';
import { cn } from '../lib/utils';
import { ExportMenu } from '../components/export-menu';
import { CustomizableTable } from '../components/ui/customizable-table';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { TransactionPreview } from '../components/daily-report/transaction-preview';

type TabType = 'transactions' | 'orders' | 'products' | 'returns' | 'settings';

export function CustomerDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getOrdersByCustomer } = useOrders();
  const [activeTab, setActiveTab] = useState<TabType>('transactions');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [columns, setColumns] = useState(() => {
    const saved = localStorage.getItem('customerTransactionsColumns');
    return saved ? JSON.parse(saved) : [
      { id: 'date', label: 'Tarih', visible: true, order: 0 },
      { id: 'dueDate', label: 'Vade Tarihi', visible: true, order: 1 },
      { id: 'type', label: 'İşlem', visible: true, order: 2 },
      { id: 'series', label: 'Seri', visible: true, order: 3 },
      { id: 'sequence', label: 'Sıra', visible: true, order: 4 },
      { id: 'description', label: 'Açıklama', visible: true, order: 5 },
      { id: 'amount', label: 'Tutar', visible: true, order: 6 },
      { id: 'balance', label: 'Bakiye', visible: true, order: 7 }
    ];
  });

  // Müşteri bilgilerini çek
  const { data: customer, isLoading, error } = useQuery({
    queryKey: ['customer', id],
    queryFn: async () => {
      const dbCustomer = await getCustomerById(id!);
      syncCustomers().catch(console.error);
      if (!dbCustomer) {
        throw new Error('Müşteri bulunamadı');
      }
      return {
        id: dbCustomer.cari_kod,
        name: dbCustomer.name,
        name2: dbCustomer.name2,
        taxNumber: dbCustomer.taxNumber,
        email: dbCustomer.cari_EMail,
        phone: dbCustomer.phone,
        address: `${dbCustomer.adr_cadde || ''} ${dbCustomer.adr_mahalle || ''} ${dbCustomer.adr_sokak || ''} ${dbCustomer.adr_Semt || ''} ${dbCustomer.adr_ilce || ''} ${dbCustomer.adr_il || ''}`.trim() || 'Adres bilgisi bulunamadı',
        region: dbCustomer.region,
        creditLimit: 50000,
        balance: 0,
        createDate: dbCustomer.cari_create_date,
        updateDate: dbCustomer.cari_lastup_date,
        transactionType: dbCustomer.cari_hareket_tipi,
        connectionType: dbCustomer.cari_baglanti_tipi,
        taxOffice: dbCustomer.cari_vdaire_adi,
        registrationNumber: dbCustomer.cari_sicil_no,
        taxId: dbCustomer.cari_VergiKimlikNo
      };
    },
    enabled: !!id
  });

  // Hesap hareketleri çek
  const { data: transactions = [], isLoading: isLoadingTransactions } = useQuery({
    queryKey: ['customerTransactions', id, selectedYear],
    queryFn: () => fetchCustomerTransactions(id!, selectedYear),
    enabled: !!id
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Yükleniyor...</p>
      </div>
    );
  }

  if (error || !customer) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-500">Bir hata oluştu. Lütfen sayfayı yenileyin.</p>
      </div>
    );
  }

  const sortedTransactions = [...transactions].sort((a, b) => {
    return new Date(a.date).getTime() - new Date(b.date).getTime(); // Tarihe göre artan sırada sıralama
  });

  // Bakiye Hesaplama
  let salesTotal = 0;
  let paymentsTotal = 0;
  let purchasesTotal = 0;
  let openingDebtTotal = 0; // Açılış Fişi Borç için yeni değişken
  let openingCreditTotal = 0; // Açılış Fişi Alacak (eski "DEVİR FİŞİ ÖNCEKİ YILDAN BORÇLU DEVİR")
  let tediyeTotal = 0;
  let salesReturnTotal = 0;
  let previousYearCreditTotal = 0;
  let purchaseReturnTotal = 0;

  for (const t of sortedTransactions) {
    const { type, amount } = t;

    if (type === 'Satış') {
      salesTotal += amount;
    } else if (type === 'Tahsilat') {
      paymentsTotal += amount;
    } else if (type === 'Alış') {
      purchasesTotal += amount;
    } else if (type === 'Açılış Fişi Alacak') { // Güncellenmiş isim
      openingCreditTotal += amount;
    } else if (type === 'Açılış Fişi Borç') { // Çıkarılanlara eklendi
      openingDebtTotal += amount;
    } else if (type === 'Tediye') {
      tediyeTotal += amount;
    } else if (type === 'Satış İade') {
      salesReturnTotal += amount;
    } else if (type === 'Alış İade') {
      purchaseReturnTotal += amount;
    }
  }

  // Açılış Fişi Borç ve Açılış Fişi Alacak güncellenerek hesaplamaya dahil edildi
  const computedBalance = 
    (salesTotal + tediyeTotal + salesReturnTotal + previousYearCreditTotal + openingCreditTotal) -
    (paymentsTotal + purchasesTotal + openingDebtTotal + purchaseReturnTotal);

  // Birikimli Bakiye Hesaplama
  let runningBalance = 0;
  const formattedTransactions = sortedTransactions.map((transaction) => {
    if (transaction.type === 'Satış' || transaction.type === 'Alış İade' || transaction.type === 'Açılış Fişi Borç') {
      runningBalance += transaction.amount;
    } else if (transaction.type === 'Tahsilat' || transaction.type === 'Alış') {
      runningBalance -= transaction.amount;
    }
    return {
      date: new Date(transaction.date).toLocaleDateString('tr-TR'),
      dueDate: transaction.dueDate ? new Date(transaction.dueDate).toLocaleDateString('tr-TR') : '-',
      type: transaction.type,
      series: transaction.series || '-',
      sequence: transaction.sequence,
      description: transaction.description,
      amount: formatCurrency(Math.abs(transaction.amount)),
      balance: formatCurrency(runningBalance),
      originalTransaction: transaction,
    };
  });

  const customerOrders = getOrdersByCustomer(customer.id);

  const handleExport = async (format: 'excel' | 'pdf' | 'png') => {
    const content = document.getElementById('transactions-table');
    if (!content) return;

    switch (format) {
      case 'excel':
        const data = sortedTransactions.map(t => ({
          'Tarih': new Date(t.date).toLocaleDateString('tr-TR'),
          'İşlem': t.type,
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
    sortedTransactions.forEach(t => {
      message += `${new Date(t.date).toLocaleDateString('tr-TR')} - ${t.type} - ${formatCurrency(t.amount)}\n`;
    });
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${customer.phone.replace(/\D/g, '')}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="p-4">
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
                <p className="text-sm text-gray-500 dark:text-gray-400">#{customer.id}</p>
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
              <p className={`text-2xl font-bold ${runningBalance >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {formatCurrency(runningBalance)}
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
                <div className="flex items-center justify-between">
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                    className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700"
                  >
                    {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                  <div className="flex items-center gap-2">
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

                <div className="relative mt-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Ara..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 h-10 rounded-lg border border-gray-200 dark:border-gray-700"
                  />
                </div>

                <div id="transactions-table" className="mt-4">
                  <CustomizableTable
                    columns={columns}
                    data={formattedTransactions.filter(ft =>
                      !searchQuery ||
                      ft.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                      ft.type.toLowerCase().includes(searchQuery.toLowerCase())
                    )}
                    onRowClick={(row) => setSelectedTransaction(row.originalTransaction)}
                    onColumnSettingsChange={setColumns}
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                    className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700"
                  >
                    {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>

                <div className="relative mt-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Fatura No veya Açıklama Ara..."
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
                      <th className="text-left p-4">Tarih</th>
                      <th className="text-left p-4">Seri</th>
                      <th className="text-left p-4">Sıra</th>
                      <th className="text-left p-4">Açıklama</th>
                      <th className="text-right p-4">Tutar</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoadingTransactions ? (
                      <tr>
                        <td colSpan={5} className="text-center p-4">Yükleniyor...</td>
                      </tr>
                    ) : (
                      sortedTransactions
                        .filter(transaction => 
                          transaction.type === 'Satış' &&
                          (!searchQuery || 
                            transaction.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            `${transaction.series}${transaction.sequence}`.toLowerCase().includes(searchQuery.toLowerCase())
                          )
                        )
                        .map((transaction) => (
                          <tr 
                            key={transaction.id}
                            onClick={() => setSelectedTransaction(transaction)}
                            className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                          >
                            <td className="p-4">{new Date(transaction.date).toLocaleDateString('tr-TR')}</td>
                            <td className="p-4">{transaction.series}</td>
                            <td className="p-4">{transaction.sequence}</td>
                            <td className="p-4">{transaction.description}</td>
                            <td className="p-4 text-right">{formatCurrency(Math.abs(transaction.amount))}</td>
                          </tr>
                        ))
                    )}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-gray-200 dark:border-gray-700 font-bold">
                      <td colSpan={4} className="p-4 text-right">Toplam:</td>
                      <td className="p-4 text-right">
                        {formatCurrency(
                          sortedTransactions
                            .filter(transaction => transaction.type === 'Satış')
                            .reduce((sum, t) => sum + Math.abs(t.amount), 0)
                        )}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'products' && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <p className="text-gray-500 text-center">Bu bölüm yapım aşamasındadır.</p>
            </div>
          )}

          {activeTab === 'returns' && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                    className="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700"
                  >
                    {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>

                <div className="relative mt-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Fatura/İade No veya Açıklama Ara..."
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
                      <th className="text-left p-4">Tarih</th>
                      <th className="text-left p-4">Fatura/İade No</th>
                      <th className="text-left p-4">İşlem Tipi</th>
                      <th className="text-left p-4">Açıklama</th>
                      <th className="text-right p-4">Tutar</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoadingTransactions ? (
                      <tr>
                        <td colSpan={5} className="text-center p-4">Yükleniyor...</td>
                      </tr>
                    ) : (
                      sortedTransactions
                        .filter(transaction => 
                          (transaction.type === 'Alış İade' || transaction.type === 'Alış') &&
                          (!searchQuery || 
                            transaction.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            `${transaction.series}${transaction.sequence}`.toLowerCase().includes(searchQuery.toLowerCase())
                          )
                        )
                        .map((transaction) => (
                          <tr 
                            key={transaction.id}
                            onClick={() => setSelectedTransaction(transaction)}
                            className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                          >
                            <td className="p-4">{new Date(transaction.date).toLocaleDateString('tr-TR')}</td>
                            <td className="p-4">{transaction.series}{transaction.sequence}</td>
                            <td className="p-4">{transaction.type}</td>
                            <td className="p-4">{transaction.description}</td>
                            <td className="p-4 text-right">{formatCurrency(Math.abs(transaction.amount))}</td>
                          </tr>
                        ))
                    )}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-gray-200 dark:border-gray-700 font-bold">
                      <td colSpan={4} className="p-4 text-right">Toplam:</td>
                      <td className="p-4 text-right">
                        {formatCurrency(
                          sortedTransactions
                            .filter(transaction => transaction.type === 'Alış İade' || transaction.type === 'Alış')
                            .reduce((sum, t) => sum + Math.abs(t.amount), 0)
                        )}
                      </td>
                    </tr>
                  </tfoot>
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
                        value={''}
                        className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700"
                        placeholder="41.0082"
                        readOnly
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-500 mb-1">Boylam</label>
                      <input
                        type="text"
                        value={''}
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
    </div>
  );
}

import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Plus, CreditCard, Banknote, FileText, FileCheck, Building } from 'lucide-react';
import { useCustomer } from '../hooks/use-customer';
import { CustomerSelector } from '../components/sales/customer-selector';
import { CustomerInfo } from '../components/sales/customer-info';
import { PaymentRow } from '../components/payments/payment-row';
import { ReceiptPreview } from '../components/payments/receipt-preview';
import { formatCurrency } from '../lib/utils';
import { cn } from '../lib/utils';
import { useApprovals } from '../hooks/use-approvals';
import { useTransactions } from '../hooks/use-transactions';
import { useAuth } from '../hooks/use-auth';
import { useSettings } from '../hooks/use-settings';

type TabType = 'tahsilat' | 'tediye';
type PaymentType = 'nakit' | 'krediKarti' | 'cek' | 'senet' | 'havale';

export function PaymentsPage() {
  const navigate = useNavigate();
  const { selectedCustomer, setSelectedCustomer } = useCustomer();
  const { addApproval } = useApprovals();
  const { addTransaction } = useTransactions();
  const { user } = useAuth();
  const { approvalSettings } = useSettings();
  const [selectedTab, setSelectedTab] = useState<TabType>('tahsilat');
  const [payments, setPayments] = useState<Array<{ type: PaymentType; data: any }>>([]);
  const [note, setNote] = useState('');
  const [showReceiptPreview, setShowReceiptPreview] = useState(false);
  const [savedReceipt, setSavedReceipt] = useState<any>(null);

  const total = payments.reduce((sum, payment) => sum + Number(payment.data.amount), 0);

  const handleAddPayment = (type: PaymentType) => {
    const newPayment = {
      type,
      data: {
        amount: '',
        ...(type === 'krediKarti' && { bank: '' }),
        ...(type === 'havale' && { bank: '' }),
        ...(type === 'cek' && {
          bank: '',
          branch: '',
          checkNumber: '',
          accountNumber: '',
          dueDate: '',
        }),
        ...(type === 'senet' && {
          debtorName: '',
          debtorId: '',
          bondNumber: '',
          issueDate: '',
          dueDate: '',
        }),
      },
    };
    setPayments([...payments, newPayment]);
  };

  const handleUpdatePayment = (index: number, data: any) => {
    const updatedPayments = [...payments];
    updatedPayments[index].data = data;
    setPayments(updatedPayments);
  };

  const handleRemovePayment = (index: number) => {
    setPayments(payments.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    if (!selectedCustomer) {
      alert('Lütfen müşteri seçiniz');
      return;
    }
    if (payments.length === 0) {
      alert('Lütfen en az bir ödeme ekleyiniz');
      return;
    }

    const receipt = {
      id: `RCP${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      date: new Date().toISOString(),
      type: selectedTab,
      customer: {
        id: selectedCustomer.id,
        name: selectedCustomer.name,
        taxNumber: selectedCustomer.taxNumber,
        address: selectedCustomer.address,
        phone: selectedCustomer.phone,
      },
      payments,
      note,
      total,
    };

    if ((selectedTab === 'tahsilat' && approvalSettings.payments) || 
        (selectedTab === 'tediye' && approvalSettings.expenses)) {
      addApproval({
        type: selectedTab === 'tahsilat' ? 'payment' : 'expense',
        user: user?.name || 'Unknown User',
        oldData: null,
        newData: receipt,
        description: `${selectedCustomer.name} - ${formatCurrency(total)}`,
        amount: total,
        customer: {
          id: selectedCustomer.id,
          name: selectedCustomer.name,
        },
      });

      setPayments([]);
      setNote('');
      setSelectedCustomer(null);
      navigate('/dashboard');
    } else {
      // Add transaction to update customer balance and history
      addTransaction({
        type: selectedTab === 'tahsilat' ? 'payment' : 'expense',
        description: selectedTab === 'tahsilat' ? 'Tahsilat' : 'Tediye',
        customer: receipt.customer,
        amount: selectedTab === 'tahsilat' ? total : -total,
        paymentMethod: payments.map(p => {
          switch (p.type) {
            case 'nakit': return 'Nakit';
            case 'krediKarti': return `Kredi Kartı (${p.data.bank})`;
            case 'cek': return `Çek (${p.data.bank} - ${p.data.checkNumber})`;
            case 'senet': return `Senet (${p.data.bondNumber})`;
            case 'havale': return `Havale (${p.data.bank})`;
            default: return p.type;
          }
        }).join(', '),
        note,
        date: new Date().toISOString(),
      });

      // Show receipt preview
      setSavedReceipt(receipt);
      setShowReceiptPreview(true);

      // Reset form
      setPayments([]);
      setNote('');
      setSelectedCustomer(null);
    }
  };

  return (
    <div className="p-6">
      {!selectedCustomer ? (
        <CustomerSelector onSelect={setSelectedCustomer} />
      ) : (
        <>
          <div className="mb-6">
            <CustomerInfo
              customer={selectedCustomer}
              onEdit={() => setSelectedCustomer(null)}
            />
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex gap-4 mb-6">
              <button
                onClick={() => setSelectedTab('tahsilat')}
                className={cn(
                  'px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700',
                  selectedTab === 'tahsilat'
                    ? 'bg-primary-50 dark:bg-primary-900/50 text-primary-600 border-primary-600'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                )}
              >
                Tahsilat
              </button>
              <button
                onClick={() => setSelectedTab('tediye')}
                className={cn(
                  'px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700',
                  selectedTab === 'tediye'
                    ? 'bg-primary-50 dark:bg-primary-900/50 text-primary-600 border-primary-600'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                )}
              >
                Tediye
              </button>
            </div>

            <div className="space-y-4 mb-6">
              {payments.map((payment, index) => (
                <PaymentRow
                  key={index}
                  type={payment.type}
                  data={payment.data}
                  onChange={(data) => handleUpdatePayment(index, data)}
                  onDelete={() => handleRemovePayment(index)}
                />
              ))}
            </div>

            <div className="flex gap-2 mb-6 overflow-x-auto py-2">
              <button
                onClick={() => handleAddPayment('nakit')}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 whitespace-nowrap"
              >
                <Banknote className="w-5 h-5" />
                <span>Nakit</span>
              </button>
              <button
                onClick={() => handleAddPayment('krediKarti')}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 whitespace-nowrap"
              >
                <CreditCard className="w-5 h-5" />
                <span>Kredi Kartı</span>
              </button>
              <button
                onClick={() => handleAddPayment('cek')}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 whitespace-nowrap"
              >
                <FileText className="w-5 h-5" />
                <span>Çek</span>
              </button>
              <button
                onClick={() => handleAddPayment('senet')}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 whitespace-nowrap"
              >
                <FileCheck className="w-5 h-5" />
                <span>Senet</span>
              </button>
              <button
                onClick={() => handleAddPayment('havale')}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 whitespace-nowrap"
              >
                <Building className="w-5 h-5" />
                <span>Havale</span>
              </button>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Not</label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700"
                rows={3}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Toplam</p>
                <p className="text-2xl font-bold">{formatCurrency(total)}</p>
              </div>
              <button
                onClick={handleSave}
                disabled={payments.length === 0}
                className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
              >
                Kaydet
              </button>
            </div>
          </div>

          {showReceiptPreview && savedReceipt && (
            <ReceiptPreview
              data={savedReceipt}
              onClose={() => {
                setShowReceiptPreview(false);
                navigate('/dashboard');
              }}
              onPrint={() => {
                const printContent = document.getElementById('receipt-content');
                if (!printContent) return;

                const printWindow = window.open('', '_blank');
                if (!printWindow) return;

                printWindow.document.write(`
                  <html>
                    <head>
                      <title>Makbuz</title>
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
        </>
      )}
    </div>
  );
}
import { X, Printer } from 'lucide-react';
import { formatCurrency } from '../../lib/utils';
import { usePayments } from '../../hooks/use-payments';
import { useState } from 'react';
import { ImageCarousel } from '../products/image-carousel';

type ReceiptPreviewProps = {
  data: {
    id: string;
    date: string;
    customer: {
      id: string;
      name: string;
      taxNumber: string;
      address: string;
      phone: string;
    };
    type: 'tahsilat' | 'tediye';
    payments: Array<{
      id: string;
      type: string;
      data: any;
    }>;
    note: string;
  };
  onClose: () => void;
  onPrint: () => void;
};

export function ReceiptPreview({ data, onClose, onPrint }: ReceiptPreviewProps) {
  const total = data.payments.reduce((sum, payment) => sum + Number(payment.data.amount), 0);
  const { getAttachments } = usePayments();
  const [showAttachments, setShowAttachments] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<string | null>(null);

  const attachments = selectedPayment ? 
    getAttachments(selectedPayment).flatMap(a => a.files) : [];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-3xl">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-bold">{data.type === 'tahsilat' ? 'Tahsilat' : 'Tediye'} Makbuzu</h2>
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
        
        <div id="receipt-content" className="p-6">
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="font-medium mb-2">Müşteri Bilgileri</h3>
              <p className="font-medium">{data.customer.name}</p>
              <p className="text-sm text-gray-500">{data.customer.address}</p>
              <p className="text-sm text-gray-500">Tel: {data.customer.phone}</p>
              <p className="text-sm text-gray-500">VKN: {data.customer.taxNumber}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Tarih</p>
              <p className="font-medium">
                {new Date(data.date).toLocaleDateString('tr-TR')}
              </p>
              <p className="text-sm text-gray-500 mt-2">Makbuz No</p>
              <p className="font-medium">{data.id}</p>
            </div>
          </div>

          <table className="w-full mb-6">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-2">Ödeme Tipi</th>
                <th className="text-left py-2">Detay</th>
                <th className="text-right py-2">Tutar</th>
              </tr>
            </thead>
            <tbody>
              {data.payments.map((payment, index) => (
                <tr key={index} className="border-b border-gray-200 dark:border-gray-700">
                  <td className="py-2 capitalize">{payment.type}</td>
                  <td className="py-2">
                    {payment.data.dueDate && (
                      <span>
                        Vade: {new Date(payment.data.dueDate).toLocaleDateString('tr-TR')} - 
                        {payment.type === 'cek' ? (
                          `${payment.data.bank} - ${payment.data.checkNumber}`
                        ) : payment.type === 'senet' ? (
                          `${payment.data.debtorName} - ${payment.data.bondNumber}`
                        ) : payment.type === 'krediKarti' ? (
                          payment.data.bank
                        ) : ''}
                      </span>
                    )}
                    {(payment.type === 'cek' || payment.type === 'senet') && (
                      <button
                        onClick={() => {
                          setSelectedPayment(payment.id);
                          setShowAttachments(true);
                        }}
                        className="ml-2 p-1 text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/50 rounded"
                      >
                        <Image className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                  <td className="text-right">{formatCurrency(Number(payment.data.amount))}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="font-bold">
                <td colSpan={2} className="py-2 text-right">Toplam</td>
                <td className="text-right">{formatCurrency(total)}</td>
              </tr>
            </tfoot>
          </table>

          {data.note && (
            <div className="mb-6">
              <h3 className="font-medium mb-2">Not</h3>
              <p className="text-sm text-gray-500">{data.note}</p>
            </div>
          )}
        </div>
      </div>
      
      {showAttachments && attachments.length > 0 && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[60]">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-2xl">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="font-medium">Evrak Görüntüleri</h3>
              <button
                onClick={() => {
                  setShowAttachments(false);
                  setSelectedPayment(null);
                }}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4">
              <ImageCarousel 
                images={attachments.map(file => ({
                  id: file.id,
                  url: file.url,
                  order: 0
                }))}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
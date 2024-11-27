import { X, AlertTriangle } from 'lucide-react';
import { formatDate } from '../../lib/utils';

interface MergeHistoryItem {
  date: string;
  quantities: {
    department: string;
    quantity: number;
  }[];
  totalQuantity: number;
}

interface MergeHistoryPopupProps {
  productName: string;
  mergeHistory: MergeHistoryItem[];
  onClose: () => void;
}

export function MergeHistoryPopup({
  productName,
  mergeHistory,
  onClose
}: MergeHistoryPopupProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[60]">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-500" />
            <h3 className="font-medium">Birleştirme Geçmişi</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4">
          <h4 className="font-medium mb-4">{productName}</h4>
          
          <div className="space-y-4">
            {mergeHistory.map((merge, index) => (
              <div
                key={index}
                className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg"
              >
                <p className="text-sm text-gray-500 mb-2">
                  {formatDate(new Date(merge.date))}
                </p>
                
                <div className="space-y-2 mb-2">
                  {merge.quantities.map((q, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span>{q.department}</span>
                      <span>{q.quantity} adet</span>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between font-medium pt-2 border-t border-gray-200 dark:border-gray-700">
                  <span>Toplam</span>
                  <span>{merge.totalQuantity} adet</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
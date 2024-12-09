import { X, AlertTriangle } from 'lucide-react';

interface DeleteConfirmationPopupProps {
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteConfirmationPopup({ onConfirm, onCancel }: DeleteConfirmationPopupProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[60]">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md">
        <div className="flex items-center gap-3 p-4 border-b border-gray-200 dark:border-gray-700">
          <AlertTriangle className="w-5 h-5 text-red-500" />
          <h3 className="font-medium">Sayım Listesini Sil</h3>
        </div>

        <div className="p-4">
          <p>Bu sayım listesini silmek istediğinizden emin misiniz?</p>
          <p className="text-sm text-gray-500 mt-2">Bu işlem geri alınamaz.</p>
        </div>

        <div className="flex justify-end gap-2 p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            İptal
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Evet, Sil
          </button>
        </div>
      </div>
    </div>
  );
}
import { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import { CountedProduct } from '../../hooks/use-inventory-count';

interface MergeConfirmationPopupProps {
  product: CountedProduct;
  existingCount: CountedProduct;
  onConfirm: () => void;
  onCancel: () => void;
}

export function MergeConfirmationPopup({
  product,
  existingCount,
  onConfirm,
  onCancel
}: MergeConfirmationPopupProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[60]">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md">
        <div className="flex items-center gap-3 p-4 border-b border-gray-200 dark:border-gray-700">
          <AlertTriangle className="w-5 h-5 text-yellow-500" />
          <h3 className="font-medium">Ürün Birleştirme</h3>
        </div>

        <div className="p-4">
          <p className="mb-4">
            "{product.name}" ürünü {product.countedDepartments[0]} reyonunda daha önce sayılmış. 
            Mevcut sayımı birleştirmek istiyor musunuz?
          </p>

          <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg mb-4">
            <p className="text-sm mb-2">Mevcut Sayım:</p>
            <p className="font-medium">{existingCount.countedStock} adet</p>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700/50 p-4 rounded-lg">
            <p className="text-sm mb-2">Yeni Sayım:</p>
            <p className="font-medium">{product.countedStock} adet</p>
          </div>
        </div>

        <div className="flex justify-end gap-2 p-4 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            Hayır, Ayrı Tut
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700"
          >
            Evet, Birleştir
          </button>
        </div>
      </div>
    </div>
  );
}
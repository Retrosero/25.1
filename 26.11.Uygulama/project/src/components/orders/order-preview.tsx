import { X, Printer } from 'lucide-react';
import { formatCurrency } from '../../lib/utils';
import { products } from '../../data/products';

type OrderPreviewProps = {
  order: {
    id: string;
    date: string;  // Changed from Date to string since we receive ISO string
    customer: {
      id: string;
      name: string;
      taxNumber: string;
      address: string;
      phone: string;
    };
    items: Array<{ productId: string; quantity: number }>;
    discount: number;
    orderNote: string;
    total: number;
  };
  onClose: () => void;
  onPrint: () => void;
};

export function OrderPreview({ order, onClose, onPrint }: OrderPreviewProps) {
  const orderItems = order.items.map(item => {
    const product = products.find(p => p.id === item.productId);
    if (!product) return null;
    return {
      ...item,
      name: product.name,
      price: product.price,
      total: product.price * item.quantity
    };
  }).filter(Boolean);

  const subtotal = orderItems.reduce((sum, item) => sum + (item?.total || 0), 0);
  const discountAmount = subtotal * (order.discount / 100);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-3xl">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-bold">Sipariş Detayı</h2>
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
        
        <div id="order-content" className="p-6">
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="font-medium mb-2">Müşteri Bilgileri</h3>
              <p className="font-medium">{order.customer.name}</p>
              <p className="text-sm text-gray-500">{order.customer.address}</p>
              <p className="text-sm text-gray-500">Tel: {order.customer.phone}</p>
              <p className="text-sm text-gray-500">VKN: {order.customer.taxNumber}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Tarih</p>
              <p className="font-medium">
                {new Date(order.date).toLocaleDateString('tr-TR')}
              </p>
              <p className="text-sm text-gray-500 mt-2">Sipariş No</p>
              <p className="font-medium">{order.id}</p>
            </div>
          </div>

          <table className="w-full mb-6">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-2">Ürün</th>
                <th className="text-right py-2">Birim Fiyat</th>
                <th className="text-right py-2">Miktar</th>
                <th className="text-right py-2">Toplam</th>
              </tr>
            </thead>
            <tbody>
              {orderItems.map((item, index) => (
                <tr key={index} className="border-b border-gray-200 dark:border-gray-700">
                  <td className="py-2">{item?.name}</td>
                  <td className="text-right">{formatCurrency(item?.price || 0)}</td>
                  <td className="text-right">{item?.quantity}</td>
                  <td className="text-right">{formatCurrency(item?.total || 0)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <td colSpan={3} className="py-2 text-right">Ara Toplam</td>
                <td className="text-right">{formatCurrency(subtotal)}</td>
              </tr>
              {order.discount > 0 && (
                <tr className="border-b border-gray-200 dark:border-gray-700 text-green-600">
                  <td colSpan={3} className="py-2 text-right">İskonto ({order.discount}%)</td>
                  <td className="text-right">-{formatCurrency(discountAmount)}</td>
                </tr>
              )}
              <tr className="font-bold">
                <td colSpan={3} className="py-2 text-right">Toplam</td>
                <td className="text-right">{formatCurrency(order.total)}</td>
              </tr>
            </tfoot>
          </table>

          {order.orderNote && (
            <div>
              <h3 className="font-medium mb-2">Sipariş Notu</h3>
              <p className="text-sm text-gray-500">{order.orderNote}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
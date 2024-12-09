import { formatCurrency } from '../../lib/utils';

interface ApprovalDetailProps {
  approval: any;
}

export function ApprovalDetail({ approval }: ApprovalDetailProps) {
  switch (approval.type) {
    case 'sale':
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="font-medium mb-2">Müşteri Bilgileri</h3>
              <p className="font-medium">{approval.newData.customer.name}</p>
              <p className="text-sm text-gray-500">{approval.newData.customer.address}</p>
              <p className="text-sm text-gray-500">Tel: {approval.newData.customer.phone}</p>
              <p className="text-sm text-gray-500">VKN: {approval.newData.customer.taxNumber}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Tarih</p>
              <p className="font-medium">
                {new Date(approval.date).toLocaleDateString('tr-TR')}
              </p>
              <p className="text-sm text-gray-500 mt-2">İşlem No</p>
              <p className="font-medium">{approval.id}</p>
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
              {approval.newData.items.map((item: any, index: number) => (
                <tr key={index} className="border-b border-gray-200 dark:border-gray-700">
                  <td className="py-2">{item.name}</td>
                  <td className="text-right">{formatCurrency(item.price)}</td>
                  <td className="text-right">{item.quantity}</td>
                  <td className="text-right">{formatCurrency(item.price * item.quantity)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              {approval.newData.discount > 0 && (
                <tr className="border-b border-gray-200 dark:border-gray-700 text-green-600">
                  <td colSpan={3} className="py-2 text-right">İskonto ({approval.newData.discount}%)</td>
                  <td className="text-right">-{formatCurrency(approval.newData.total * (approval.newData.discount / 100))}</td>
                </tr>
              )}
              <tr className="font-bold">
                <td colSpan={3} className="py-2 text-right">Toplam</td>
                <td className="text-right">{formatCurrency(approval.newData.total)}</td>
              </tr>
            </tfoot>
          </table>

          {approval.newData.note && (
            <div>
              <h3 className="font-medium mb-2">Not</h3>
              <p className="text-sm text-gray-500">{approval.newData.note}</p>
            </div>
          )}
        </div>
      );

    case 'payment':
    case 'expense':
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="font-medium mb-2">Müşteri Bilgileri</h3>
              <p className="font-medium">{approval.newData.customer.name}</p>
              <p className="text-sm text-gray-500">{approval.newData.customer.address}</p>
              <p className="text-sm text-gray-500">Tel: {approval.newData.customer.phone}</p>
              <p className="text-sm text-gray-500">VKN: {approval.newData.customer.taxNumber}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Tarih</p>
              <p className="font-medium">
                {new Date(approval.date).toLocaleDateString('tr-TR')}
              </p>
              <p className="text-sm text-gray-500 mt-2">Makbuz No</p>
              <p className="font-medium">{approval.id}</p>
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
              {approval.newData.payments.map((payment: any, index: number) => (
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
                  </td>
                  <td className="text-right">{formatCurrency(Number(payment.data.amount))}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="font-bold">
                <td colSpan={2} className="py-2 text-right">Toplam</td>
                <td className="text-right">{formatCurrency(approval.newData.total)}</td>
              </tr>
            </tfoot>
          </table>

          {approval.newData.note && (
            <div>
              <h3 className="font-medium mb-2">Not</h3>
              <p className="text-sm text-gray-500">{approval.newData.note}</p>
            </div>
          )}
        </div>
      );

    case 'return':
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="font-medium mb-2">Müşteri Bilgileri</h3>
              <p className="font-medium">{approval.newData.customer.name}</p>
              <p className="text-sm text-gray-500">{approval.newData.customer.address}</p>
              <p className="text-sm text-gray-500">Tel: {approval.newData.customer.phone}</p>
              <p className="text-sm text-gray-500">VKN: {approval.newData.customer.taxNumber}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Tarih</p>
              <p className="font-medium">
                {new Date(approval.date).toLocaleDateString('tr-TR')}
              </p>
              <p className="text-sm text-gray-500 mt-2">İade No</p>
              <p className="font-medium">{approval.id}</p>
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
              {approval.newData.items.map((item: any, index: number) => (
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
                <td colSpan={3} className="py-2 text-right">Toplam</td>
                <td className="text-right">{formatCurrency(approval.newData.total)}</td>
              </tr>
            </tfoot>
          </table>

          {approval.newData.note && (
            <div>
              <h3 className="font-medium mb-2">Not</h3>
              <p className="text-sm text-gray-500">{approval.newData.note}</p>
            </div>
          )}
        </div>
      );

    case 'order_change':
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="font-medium mb-2">Müşteri Bilgileri</h3>
              <p className="font-medium">{approval.newData.customer.name}</p>
              <p className="text-sm text-gray-500">{approval.newData.customer.address}</p>
              <p className="text-sm text-gray-500">Tel: {approval.newData.customer.phone}</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Tarih</p>
              <p className="font-medium">
                {new Date(approval.date).toLocaleDateString('tr-TR')}
              </p>
              <p className="text-sm text-gray-500 mt-2">Sipariş No</p>
              <p className="font-medium">{approval.newData.id}</p>
            </div>
          </div>

          <table className="w-full mb-6">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-2">Ürün</th>
                <th className="text-center py-2">İstenen</th>
                <th className="text-center py-2">Yeni</th>
                <th className="text-right py-2">Birim Fiyat</th>
                <th className="text-right py-2">Yeni Toplam</th>
              </tr>
            </thead>
            <tbody>
              {approval.newData.items.map((item: any, index: number) => {
                const oldItem = approval.oldData.items.find((i: any) => i.productId === item.productId);
                const newTotal = item.price * item.quantity;
                
                return (
                  <tr key={index} className="border-b border-gray-200 dark:border-gray-700">
                    <td className="py-2">
                      <div>
                        <p>{item.name}</p>
                        {item.note && (
                          <p className="text-sm text-gray-500 mt-1">Not: {item.note}</p>
                        )}
                      </div>
                    </td>
                    <td className="text-center">{oldItem?.quantity}</td>
                    <td className="text-center">{item.quantity}</td>
                    <td className="text-right">{formatCurrency(item.price)}</td>
                    <td className="text-right">{formatCurrency(newTotal)}</td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="font-bold">
                <td colSpan={4} className="py-2 text-right">Eski Toplam</td>
                <td className="text-right">{formatCurrency(approval.oldData.totalAmount)}</td>
              </tr>
              <tr className="font-bold">
                <td colSpan={4} className="py-2 text-right">Yeni Toplam</td>
                <td className="text-right">{formatCurrency(approval.newData.totalAmount)}</td>
              </tr>
            </tfoot>
          </table>

          {approval.newData.note && (
            <div>
              <h3 className="font-medium mb-2">Not</h3>
              <p className="text-sm text-gray-500">{approval.newData.note}</p>
            </div>
          )}
        </div>
      );

    default:
      return null;
  }
}
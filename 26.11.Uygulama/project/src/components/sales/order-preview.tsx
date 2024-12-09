<content>// Previous imports remain the same...

export function OrderPreview({ customer, items, discount, orderNote, onClose }: OrderPreviewProps) {
  const navigate = useNavigate();
  const { clearCart } = useCart();
  const { setSelectedCustomer } = useCustomer();
  const { addTransaction } = useTransactions();
  const { addApproval } = useApprovals();
  const { user } = useAuth();
  const { approvalSettings } = useSettings();

  // Previous helper functions remain the same...

  const handleComplete = () => {
    const orderData = {
      customer: {
        id: customer.id,
        name: customer.name,
        taxNumber: customer.taxNumber,
        address: customer.address,
        phone: customer.phone,
      },
      items: orderItems.map(item => ({
        productId: item?.productId || '',
        name: item?.name || '',
        quantity: item?.quantity || 0,
        price: item?.price || 0,
        note: item?.note,
      })),
      discount,
      orderNote,
      total,
      date: new Date().toISOString(),
    };

    if (approvalSettings.sales) {
      addApproval({
        type: 'sale',
        user: user?.name || 'Unknown User',
        oldData: null,
        newData: orderData,
        description: `${customer.name} - ${formatCurrency(total)}`,
        amount: total,
        customer: {
          id: customer.id,
          name: customer.name,
        },
      });
      
      clearCart();
      setSelectedCustomer(null);
      navigate('/approvals');
    } else {
      addTransaction({
        type: 'sale',
        description: 'Satış',
        customer: orderData.customer,
        amount: total,
        items: orderData.items,
        discount,
        note: orderNote,
        date: new Date().toISOString(),
      });

      clearCart();
      setSelectedCustomer(null);
      navigate('/dashboard');
    }
  };

  // Rest of the component remains the same...
}</content>
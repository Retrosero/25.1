import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useProducts } from './use-products';
import { useAuth } from './use-auth';

export type TransactionType = 'sale' | 'payment' | 'expense' | 'return';

export type Transaction = {
  id: string;
  transactionId?: string; // For linking with orders
  date: string;
  dueDate?: string; // For future payments
  type: TransactionType;
  description: string;
  customer: {
    id: string;
    name: string;
    taxNumber: string;
    address: string;
    phone: string;
  };
  amount: number;
  items?: Array<{
    productId: string;
    name: string;
    quantity: number;
    price: number;
    note?: string;
  }>;
  paymentMethod?: {
    type: 'nakit' | 'cek' | 'senet' | 'havale' | 'krediKarti';
    details?: string;
    dueDate?: string;
  };
  note?: string;
  discount?: number;
  year?: number;
  series?: string;
  sequence: number;
};

type TransactionsState = {
  transactions: Transaction[];
  addTransaction: (transaction: Omit<Transaction, 'id' | 'date' | 'sequence'> & { id?: string }) => string;
  updateTransaction: (id: string, updates: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  getTransactionsByDate: (date: string) => Transaction[];
  getTransactionsByType: (type: TransactionType) => Transaction[];
  getTransactionsByYear: (year: number) => Transaction[];
  getCustomerTransactions: (customerId: string, year?: number) => Transaction[];
  getCustomerBalance: (customerId: string) => number;
  getCustomerStats: (customerId: string) => {
    currentYearSales: number;
    lastYearSales: number;
    currentYearPayments: number;
    lastYearPayments: number;
  };
  getTransactionById: (id: string) => Transaction | undefined;
  getNextSequence: () => number;
  updateOrCreateTransaction: (transactionId: string, transaction: Omit<Transaction, 'sequence'>) => void;
};

export const useTransactions = create<TransactionsState>()(
  persist(
    (set, get) => ({
      transactions: [],
      
      addTransaction: (transaction) => {
        const { updateProduct } = useProducts.getState();
        const { user } = useAuth.getState();
        const currentYear = new Date().getFullYear();

        // If this is an update to an existing transaction
        if (transaction.id) {
          const originalTransaction = get().transactions.find(t => t.id === transaction.id);
          
          if (originalTransaction) {
            // Update stock for the difference in quantities
            if (transaction.type === 'sale' && transaction.items && originalTransaction.items) {
              // First restore original stock
              originalTransaction.items.forEach(item => {
                updateProduct(item.productId, 'increaseStock', item.quantity);
              });
              
              // Then deduct new quantities
              transaction.items.forEach(item => {
                updateProduct(item.productId, 'decreaseStock', item.quantity);
              });
            }

            // Update the transaction while preserving original metadata
            set(state => ({
              transactions: state.transactions.map(t => 
                t.id === transaction.id
                  ? {
                      ...originalTransaction,
                      ...transaction,
                      id: originalTransaction.id,
                      date: originalTransaction.date,
                      sequence: originalTransaction.sequence,
                      series: originalTransaction.series,
                    }
                  : t
              )
            }));
            return transaction.id;
          }
        }

        // For new transactions
        if (transaction.type === 'sale' && transaction.items) {
          transaction.items.forEach(item => {
            updateProduct(item.productId, 'decreaseStock', item.quantity);
          });
        }

        if (transaction.type === 'return' && transaction.items) {
          transaction.items.forEach(item => {
            updateProduct(item.productId, 'increaseStock', item.quantity);
          });
        }

        const nextSequence = get().getNextSequence();
        const newId = transaction.id || `TRX${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

        set(state => ({
          transactions: [{
            ...transaction,
            id: newId,
            date: new Date().toISOString(),
            year: currentYear,
            sequence: nextSequence,
            series: user?.series || '',
          }, ...state.transactions],
        }));

        return newId;
      },

      updateOrCreateTransaction: (transactionId, transaction) => {
        const { updateProduct } = useProducts.getState();
        const existingTransaction = get().transactions.find(t => 
          t.id === transactionId || t.transactionId === transactionId
        );

        if (existingTransaction) {
          // Restore original stock
          if (existingTransaction.items) {
            existingTransaction.items.forEach(item => {
              updateProduct(item.productId, 'increaseStock', item.quantity);
            });
          }

          // Update stock with new quantities
          if (transaction.items) {
            transaction.items.forEach(item => {
              updateProduct(item.productId, 'decreaseStock', item.quantity);
            });
          }

          // Update transaction
          set(state => ({
            transactions: state.transactions.map(t =>
              (t.id === transactionId || t.transactionId === transactionId)
                ? { ...t, ...transaction }
                : t
            )
          }));
        } else {
          // Create new transaction
          const nextSequence = get().getNextSequence();
          const { user } = useAuth.getState();

          // Update stock for new transaction
          if (transaction.items) {
            transaction.items.forEach(item => {
              updateProduct(item.productId, 'decreaseStock', item.quantity);
            });
          }

          set(state => ({
            transactions: [{
              ...transaction,
              id: transactionId,
              transactionId,
              date: new Date().toISOString(),
              year: new Date().getFullYear(),
              sequence: nextSequence,
              series: user?.series || '',
            }, ...state.transactions],
          }));
        }
      },

      updateTransaction: (id, updates) => {
        const { updateProduct } = useProducts.getState();
        const originalTransaction = get().transactions.find(t => t.id === id);

        if (originalTransaction && updates.items) {
          // Handle stock updates for modified items
          if (originalTransaction.type === 'sale') {
            // First restore original stock
            originalTransaction.items?.forEach(item => {
              updateProduct(item.productId, 'increaseStock', item.quantity);
            });
            
            // Then deduct new quantities
            updates.items.forEach(item => {
              updateProduct(item.productId, 'decreaseStock', item.quantity);
            });
          }
        }

        set(state => ({
          transactions: state.transactions.map(t =>
            t.id === id ? { ...t, ...updates } : t
          ),
        }));
      },

      deleteTransaction: (id) => {
        const transaction = get().transactions.find(t => t.id === id);
        const { updateProduct } = useProducts.getState();

        if (transaction?.items) {
          if (transaction.type === 'sale') {
            transaction.items.forEach(item => {
              updateProduct(item.productId, 'increaseStock', item.quantity);
            });
          } else if (transaction.type === 'return') {
            transaction.items.forEach(item => {
              updateProduct(item.productId, 'decreaseStock', item.quantity);
            });
          }
        }

        set(state => ({
          transactions: state.transactions.filter(t => t.id !== id)
        }));
      },

      getTransactionsByDate: (date) => {
        return get().transactions.filter(
          (transaction) => transaction.date.split('T')[0] === date
        );
      },

      getTransactionsByType: (type) => {
        return get().transactions.filter(t => t.type === type);
      },

      getTransactionsByYear: (year) => {
        return get().transactions.filter(
          (transaction) => new Date(transaction.date).getFullYear() === year
        );
      },

      getCustomerTransactions: (customerId, year) => {
        return get().transactions.filter(t => {
          const matchesCustomer = t.customer.id === customerId;
          if (year) {
            return matchesCustomer && new Date(t.date).getFullYear() === year;
          }
          return matchesCustomer;
        });
      },

      getCustomerBalance: (customerId) => {
        return get().transactions
          .filter(t => t.customer.id === customerId)
          .reduce((balance, t) => {
            let amount = 0;
            switch (t.type) {
              case 'sale':
                amount = -Math.abs(t.amount);
                break;
              case 'payment':
                amount = Math.abs(t.amount);
                break;
              case 'return':
                amount = Math.abs(t.amount);
                break;
              case 'expense':
                amount = -Math.abs(t.amount);
                break;
              default:
                amount = 0;
            }
            return balance + amount;
          }, 0);
      },

      getCustomerStats: (customerId) => {
        const currentYear = new Date().getFullYear();
        const lastYear = currentYear - 1;
        const transactions = get().transactions.filter(t => t.customer.id === customerId);

        return {
          currentYearSales: transactions
            .filter(t => t.type === 'sale' && new Date(t.date).getFullYear() === currentYear)
            .reduce((sum, t) => sum + Math.abs(t.amount), 0),
          lastYearSales: transactions
            .filter(t => t.type === 'sale' && new Date(t.date).getFullYear() === lastYear)
            .reduce((sum, t) => sum + Math.abs(t.amount), 0),
          currentYearPayments: transactions
            .filter(t => t.type === 'payment' && new Date(t.date).getFullYear() === currentYear)
            .reduce((sum, t) => sum + Math.abs(t.amount), 0),
          lastYearPayments: transactions
            .filter(t => t.type === 'payment' && new Date(t.date).getFullYear() === lastYear)
            .reduce((sum, t) => sum + Math.abs(t.amount), 0),
        };
      },

      getTransactionById: (id) => {
        return get().transactions.find(t => t.id === id || t.transactionId === id);
      },

      getNextSequence: () => {
        const transactions = get().transactions;
        if (transactions.length === 0) return 1;
        const maxSequence = Math.max(...transactions.map(t => t.sequence || 0));
        return isFinite(maxSequence) ? maxSequence + 1 : 1;
      },
    }),
    {
      name: 'transactions-storage',
    }
  )
);
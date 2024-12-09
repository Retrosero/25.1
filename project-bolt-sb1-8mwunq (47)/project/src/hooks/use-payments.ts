import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface PaymentAttachment {
  id: string;
  paymentId: string;
  type: 'check' | 'promissory';
  files: Array<{
    id: string;
    name: string;
    url: string;
    uploadDate: string;
  }>;
}

interface PaymentsState {
  attachments: PaymentAttachment[];
  addAttachment: (attachment: Omit<PaymentAttachment, 'id'>) => string;
  getAttachments: (paymentId: string) => PaymentAttachment[];
  deleteAttachment: (attachmentId: string) => void;
}

export const usePayments = create<PaymentsState>()(
  persist(
    (set, get) => ({
      attachments: [],
      
      addAttachment: (attachment) => {
        const id = `ATT${Math.random().toString(36).substr(2, 9)}`;
        const newAttachment = { ...attachment, id };
        
        set(state => ({
          attachments: [...state.attachments, newAttachment]
        }));
        
        return id;
      },

      getAttachments: (paymentId) => {
        return get().attachments.filter(a => a.paymentId === paymentId);
      },

      deleteAttachment: (attachmentId) => {
        set(state => ({
          attachments: state.attachments.filter(a => a.id !== attachmentId)
        }));
      },
    }),
    {
      name: 'payments-storage',
    }
  )
);
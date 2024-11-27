import { useState } from 'react';

type ToastProps = {
  message: string;
  type?: 'success' | 'error' | 'info';
};

export function Toaster() {
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast, index) => (
        <div
          key={index}
          className={`rounded-lg px-4 py-2 text-white ${
            toast.type === 'error'
              ? 'bg-red-500'
              : toast.type === 'success'
              ? 'bg-green-500'
              : 'bg-blue-500'
          }`}
        >
          {toast.message}
        </div>
      ))}
    </div>
  );
}
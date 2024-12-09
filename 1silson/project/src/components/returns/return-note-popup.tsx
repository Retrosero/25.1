import { X } from 'lucide-react';

interface ReturnNotePopupProps {
  note: string;
  onSave: (note: string) => void;
  onClose: () => void;
}

export function ReturnNotePopup({ note, onSave, onClose }: ReturnNotePopupProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const newNote = formData.get('note') as string;
    onSave(newNote);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="font-medium">İade Notu</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="p-4">
            <textarea
              name="note"
              defaultValue={note}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700"
              rows={4}
              placeholder="İade sebebi..."
              autoFocus
            />
          </div>
          <div className="flex justify-end gap-2 p-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              İptal
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              Kaydet
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
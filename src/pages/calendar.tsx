import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, X, CreditCard, FileText } from 'lucide-react';
import { useTransactions } from '../hooks/use-transactions';
import { formatCurrency } from '../lib/utils';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns';
import { tr } from 'date-fns/locale';
import { addNote, deleteNote, getNotesByDate, getAllNotes } from '../lib/db';
import { DeleteConfirmation } from '../components/calendar/delete-confirmation';

type CalendarNote = {
  id: string;
  date: string;
  title: string;
  content: string;
  type: 'note' | 'payment' | 'expense';
  paymentType?: 'cash' | 'check' | 'promissory';
  amount?: number;
  createdAt: string;
};

export function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [notes, setNotes] = useState<CalendarNote[]>([]);
  const [allNotes, setAllNotes] = useState<CalendarNote[]>([]);
  const [showAddNote, setShowAddNote] = useState(false);
  const [noteType, setNoteType] = useState<'note' | 'payment' | 'expense'>('note');
  const [deleteConfirmation, setDeleteConfirmation] = useState<{type: 'note' | 'payment' | 'expense', id: string} | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { transactions } = useTransactions();

  // Load all notes initially
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const notes = await getAllNotes();
        setAllNotes(notes);
      } catch (error) {
        console.error('Error loading notes:', error);
        setError('Notlar yüklenirken bir hata oluştu. Lütfen sayfayı yenileyin.');
      } finally {
        setIsLoading(false);
      }
    };
    loadInitialData();
  }, []);

  useEffect(() => {
    if (selectedDate) {
      const loadDateNotes = async () => {
        try {
          const dateStr = selectedDate.toISOString().split('T')[0];
          const savedNotes = await getNotesByDate(dateStr);
          setNotes(savedNotes);
        } catch (error) {
          console.error('Error loading notes for date:', error);
        }
      };
      loadDateNotes();
    }
  }, [selectedDate]);

  // Calculate monthly totals including manual entries
  const calculateMonthlyTotals = () => {
    const startDate = startOfMonth(currentDate);
    const endDate = endOfMonth(currentDate);
    
    // Get transactions with due dates in current month
    const monthTransactions = transactions.filter(t => {
      if (!t.dueDate) return false;
      const dueDateObj = new Date(t.dueDate);
      return dueDateObj >= startDate && dueDateObj <= endDate;
    });

    // Get manual payment entries for current month
    const monthNotes = allNotes.filter(note => {
      const noteDate = new Date(note.date);
      return noteDate >= startDate && noteDate <= endDate && (note.type === 'payment' || note.type === 'expense');
    });

    // Calculate incoming payments (including manual entries)
    const incomingTotal = monthTransactions
      .filter(t => t.type === 'payment')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0) +
      monthNotes
      .filter(n => n.type === 'payment')
      .reduce((sum, n) => sum + (n.amount || 0), 0);

    // Calculate outgoing payments (including manual entries)
    const outgoingTotal = monthTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0) +
      monthNotes
      .filter(n => n.type === 'expense')
      .reduce((sum, n) => sum + (n.amount || 0), 0);

    return { incomingTotal, outgoingTotal };
  };

  const { incomingTotal, outgoingTotal } = calculateMonthlyTotals();

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate) return;

    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    
    const newNote: CalendarNote = {
      id: Math.random().toString(36).substr(2, 9),
      date: selectedDate.toISOString().split('T')[0],
      title: formData.get('title') as string,
      content: formData.get('content') as string,
      type: noteType,
      amount: noteType !== 'note' ? Number(formData.get('amount')) : undefined,
      paymentType: noteType !== 'note' ? (formData.get('paymentType') as 'cash' | 'check' | 'promissory') : undefined,
      createdAt: new Date().toISOString(),
    };

    try {
      await addNote(newNote);
      // Refresh both note lists
      const [dateNotes, allNotesData] = await Promise.all([
        getNotesByDate(selectedDate.toISOString().split('T')[0]),
        getAllNotes()
      ]);
      setNotes(dateNotes);
      setAllNotes(allNotesData);
      setShowAddNote(false);
      form.reset();
    } catch (error) {
      console.error('Error saving note:', error);
    }
  };

  const handleDeleteNote = async (id: string, type: 'note' | 'payment' | 'expense') => {
    setDeleteConfirmation({ type, id });
  };

  const confirmDelete = async () => {
    if (!deleteConfirmation || !selectedDate) return;
    
    try {
      await deleteNote(deleteConfirmation.id);
      // Refresh both note lists
      const [dateNotes, allNotesData] = await Promise.all([
        getNotesByDate(selectedDate.toISOString().split('T')[0]),
        getAllNotes()
      ]);
      setNotes(dateNotes);
      setAllNotes(allNotesData);
      setDeleteConfirmation(null);
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  // Rest of the component remains the same as in the original file
  // (The render method and other functions are unchanged)

  return (
    <div className="p-6">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Yükleniyor...</p>
        </div>
      ) : ( 
        <>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold">Takvim</h1>
              <div className="mt-2 space-x-4">
                <span className="text-sm text-gray-500">Bu Ay:</span>
                <span className="text-sm text-green-600">
                  Gelecek Ödemeler: {formatCurrency(incomingTotal)}
                </span>
                <span className="text-sm text-red-600">
                  Giden Ödemeler: {formatCurrency(outgoingTotal)}
                </span>
              </div>
            </div>
          </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Calendar Grid */}
        <div className="w-full lg:w-auto lg:flex-1 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setCurrentDate(subMonths(currentDate, 1))}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-medium">
              {format(currentDate, 'MMMM yyyy', { locale: tr })}
            </h2>
            <button
              onClick={() => setCurrentDate(addMonths(currentDate, 1))}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-2 mb-2">
            {['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'].map(day => (
              <div key={day} className="text-center text-sm font-medium py-2">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: startOfMonth(currentDate).getDay() === 0 ? 6 : startOfMonth(currentDate).getDay() - 1 }).map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square" />
            ))}
            {eachDayOfInterval({ start: startOfMonth(currentDate), end: endOfMonth(currentDate) }).map(day => {
              const isSelected = selectedDate && isSameDay(day, selectedDate);
              const dateStr = day.toISOString().split('T')[0];
              const dayNotes = allNotes.filter(note => note.date === dateStr);
              const dayTransactions = transactions.filter(t => t.dueDate && isSameDay(new Date(t.dueDate), day));

              return (
                <button
                  key={day.toISOString()}
                  onClick={() => setSelectedDate(day)}
                  className={`aspect-square p-2 rounded-lg border relative ${
                    isSelected
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/50'
                      : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <span className="text-sm">{format(day, 'd')}</span>
                  {(dayNotes.length > 0 || dayTransactions.length > 0) && (
                    <div className="absolute bottom-1 left-1/2 -translate-x-1/2 flex gap-1">
                      {dayNotes.some(n => n.type === 'note') && (
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                      )}
                      {(dayNotes.some(n => n.type === 'payment') || dayTransactions.some(t => t.type === 'payment')) && (
                        <div className="w-1.5 h-1.5 rounded-full bg-green-600" />
                      )}
                      {(dayNotes.some(n => n.type === 'expense') || dayTransactions.some(t => t.type === 'expense')) && (
                        <div className="w-1.5 h-1.5 rounded-full bg-red-600" />
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Selected Day Details */}
        {selectedDate && (
          <div className="w-full lg:w-96 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">
                {format(selectedDate, 'd MMMM yyyy', { locale: tr })}
              </h3>
              <button
                onClick={() => setShowAddNote(true)}
                className="flex items-center gap-2 px-3 py-1.5 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                <Plus className="w-4 h-4" />
                <span>Ekle</span>
              </button>
            </div>

            <div className="space-y-4">
              {notes.map(note => (
                <div
                  key={note.id}
                  className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {note.type === 'note' ? (
                        <FileText className="w-4 h-4 text-blue-500" />
                      ) : (
                        <CreditCard className="w-4 h-4 text-green-500" />
                      )}
                      <span className="text-sm font-medium">
                        {note.title}
                      </span>
                    </div>
                    <button
                      onClick={() => handleDeleteNote(note.id, note.type)}
                      className="p-1 text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-sm">{note.content}</p>
                  {note.type !== 'note' && note.amount && (
                    <p className="text-sm font-medium text-green-600 mt-1">
                      {formatCurrency(note.amount)}
                      {note.paymentType && ` - ${
                        note.paymentType === 'cash' ? 'Nakit' :
                        note.paymentType === 'check' ? 'Çek' : 'Senet'
                      }`}
                    </p>
                  )}
                </div>
              ))}

              {notes.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">
                  Bu güne ait not veya ödeme bulunmuyor
                </p>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* Monthly Summary Table */}
      <div className="mt-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <h2 className="text-lg font-medium mb-4">Aylık Özet</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left p-2">Ay</th>
                <th className="text-right p-2">Gelecek Ödemeler</th>
                <th className="text-right p-2">Giden Ödemeler</th>
                <th className="text-right p-2">Net</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 12 }, (_, i) => {
                const date = new Date();
                date.setMonth(date.getMonth() + i);
                const monthStr = date.toLocaleString('tr-TR', { month: 'long', year: 'numeric' });
                
                const monthNotes = allNotes.filter(note => {
                  const noteDate = new Date(note.date);
                  return noteDate.getMonth() === date.getMonth() && 
                         noteDate.getFullYear() === date.getFullYear();
                });

                const incoming = monthNotes
                  .filter(n => n.type === 'payment')
                  .reduce((sum, n) => sum + (n.amount || 0), 0);
                
                const outgoing = monthNotes
                  .filter(n => n.type === 'expense')
                  .reduce((sum, n) => sum + (n.amount || 0), 0);

                return (
                  <tr key={i} className="border-b border-gray-200 dark:border-gray-700">
                    <td className="p-2">{monthStr}</td>
                    <td className="text-right text-green-600">{formatCurrency(incoming)}</td>
                    <td className="text-right text-red-600">{formatCurrency(outgoing)}</td>
                    <td className="text-right font-medium">{formatCurrency(incoming - outgoing)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {showAddNote && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="font-medium">Yeni Ekle</h3>
              <button
                onClick={() => setShowAddNote(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddNote}>
              <div className="p-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Tür</label>
                  <select
                    name="noteType"
                    onChange={(e) => {
                      setNoteType(e.target.value as 'note' | 'payment' | 'expense');
                    }}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700"
                    required
                  >
                    <option value="note">Not</option>
                    <option value="payment">Gelecek Ödeme</option>
                    <option value="expense">Giden Ödeme</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Başlık</label>
                  <input
                    type="text"
                    name="title"
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    {noteType === 'note' ? 'Not' : 'Açıklama'}
                  </label>
                  <textarea
                    name="content"
                    rows={3}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700"
                    required
                  />
                </div>

                {noteType !== 'note' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium mb-1">Tutar</label>
                      <input
                        type="number"
                        name="amount"
                        min="0"
                        step="0.01"
                        required
                        className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1">Ödeme Tipi</label>
                      <select
                        name="paymentType"
                        className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700"
                        required
                      >
                        <option value="cash">Nakit</option>
                        <option value="check">Çek</option>
                        <option value="promissory">Senet</option>
                      </select>
                    </div>
                  </>
                )}
              </div>

              <div className="flex justify-end gap-2 p-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setShowAddNote(false)}
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
      )}
      {deleteConfirmation && (
        <DeleteConfirmation
          type={deleteConfirmation.type}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteConfirmation(null)}
        />
      )}</>)}
    </div>
  );
}
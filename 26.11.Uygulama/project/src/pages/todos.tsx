import { useState, useRef } from 'react';
import { Plus, Search, Calendar, AlertCircle, CheckCircle2, Clock, Users, X, UserCircle, Image, FileCheck, Upload } from 'lucide-react';
import { useTodos } from '../hooks/use-todos';
import { useAuth } from '../hooks/use-auth';
import { useUsers } from '../hooks/use-users';
import { Todo, TodoPriority, TodoStatus } from '../types/todo';
import { cn } from '../lib/utils';

const priorityColors: Record<TodoPriority, string> = {
  low: 'bg-blue-100 text-blue-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-red-100 text-red-800',
};

const statusColors: Record<TodoStatus, string> = {
  pending: 'bg-gray-100 text-gray-800',
  'in-progress': 'bg-purple-100 text-purple-800',
  completed: 'bg-green-100 text-green-800',
};

export function TodosPage() {
  const { user } = useAuth();
  const { users } = useUsers();
  const { todos, addTodo, updateTodo, deleteTodo, addStep, updateStep, deleteStep } = useTodos();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<TodoStatus | 'all'>('all');
  const [showAddTodo, setShowAddTodo] = useState(false);
  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null);
  const [newTodoSteps, setNewTodoSteps] = useState<Array<{ id: string; title: string }>>([
    { id: Math.random().toString(36).substr(2, 9), title: '' }
  ]);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [stepAttachments, setStepAttachments] = useState<Record<string, File[]>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [completionError, setCompletionError] = useState<string | null>(null);

  const userTodos = todos.filter(todo => 
    todo.createdBy === user?.id || 
    todo.isPublic || 
    todo.assignedTo?.includes(user?.id || '')
  );

  const filteredTodos = userTodos.filter(todo => {
    const matchesSearch = !searchQuery || 
      todo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      todo.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = selectedStatus === 'all' || todo.status === selectedStatus;
    
    return matchesSearch && matchesStatus;
  });

  const handleAddTodo = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const assignedUsers = formData.getAll('assignedTo') as string[];
    const validSteps = newTodoSteps
      .filter(step => step.title.trim() !== '')
      .map(step => ({
        id: step.id,
        title: step.title.trim(),
        completed: false,
        createdAt: new Date().toISOString()
      }));
    
    // Convert attachments to base64
    const attachmentPromises = attachments.map(file => {
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
    });

    Promise.all(attachmentPromises).then(attachmentUrls => {
      const newTodo = {
        title: formData.get('title') as string,
        description: formData.get('description') as string,
        priority: formData.get('priority') as TodoPriority,
        dueDate: formData.get('dueDate') as string,
        assignedTo: assignedUsers,
        status: 'pending' as TodoStatus,
        createdBy: user?.id || '',
        isPublic: formData.get('isPublic') === 'true',
        steps: validSteps,
        attachments: attachmentUrls.map((url, index) => ({
          id: Date.now().toString() + index,
          name: attachments[index].name,
          url,
          type: attachments[index].type,
          uploadedAt: new Date().toISOString()
        }))
      };

      addTodo(newTodo);
      setShowAddTodo(false);
      setNewTodoSteps([{ id: Math.random().toString(36).substr(2, 9), title: '' }]);
      setAttachments([]);
    });
  };

  const handleAddStep = () => {
    const newStep = { id: Math.random().toString(36).substr(2, 9), title: '' };
    setNewTodoSteps([...newTodoSteps, newStep]);
  };

  const handleRemoveStep = (index: number) => {
    setNewTodoSteps(steps => steps.filter((_, i) => i !== index));
  };

  const handleStepChange = (index: number, value: string) => {
    setNewTodoSteps(steps =>
      steps.map((step, i) =>
        i === index ? { ...step, title: value.trim() } : step
      )
    );
  };

  const handleCompleteTodo = (todo: Todo) => {
    const incompleteTasks = todo.steps.filter(step => !step.completed);
    if (incompleteTasks.length > 0) {
      setCompletionError(`Tamamlanmamış ${incompleteTasks.length} alt görev bulunuyor:`);
      return;
    }
    
    updateTodo(todo.id, {
      status: 'completed',
      completedAt: new Date().toISOString(),
      completedBy: user?.id
    });
    
    setSelectedTodo(null);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAttachments(prev => [...prev, ...files]);
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Görevler</h1>
        <button
          onClick={() => setShowAddTodo(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
        >
          <Plus className="w-5 h-5" />
          <span>Yeni Görev</span>
        </button>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Görev ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 h-10 rounded-lg border border-gray-200 dark:border-gray-700"
          />
        </div>
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value as TodoStatus | 'all')}
          className="w-48 px-3 h-10 rounded-lg border border-gray-200 dark:border-gray-700"
        >
          <option value="all">Tüm Durumlar</option>
          <option value="pending">Bekliyor</option>
          <option value="in-progress">Devam Ediyor</option>
          <option value="completed">Tamamlandı</option>
        </select>
      </div>

      <div className="space-y-4">
        {filteredTodos.map((todo) => (
          <div
            key={todo.id}
            onClick={() => setSelectedTodo(todo)}
            className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 cursor-pointer hover:border-primary-500"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-medium">{todo.title}</h3>
                  <span className={cn(
                    'px-2 py-0.5 text-xs rounded-full',
                    priorityColors[todo.priority]
                  )}>
                    {todo.priority === 'low' ? 'Düşük' :
                     todo.priority === 'medium' ? 'Orta' : 'Yüksek'}
                  </span>
                  <span className={cn(
                    'px-2 py-0.5 text-xs rounded-full',
                    statusColors[todo.status]
                  )}>
                    {todo.status === 'pending' ? 'Bekliyor' :
                     todo.status === 'in-progress' ? 'Devam Ediyor' : 'Tamamlandı'}
                  </span>
                </div>
                {todo.description && (
                  <p className="text-sm text-gray-500 mt-1">{todo.description}</p>
                )}
              </div>
              <div className="flex items-center gap-4">
                {todo.dueDate && (
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    <Calendar className="w-4 h-4" />
                    {new Date(todo.dueDate).toLocaleDateString('tr-TR')}
                  </div>
                )}
                {todo.assignedTo && todo.assignedTo.length > 0 && (
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-500">
                      {todo.assignedTo.length} kişi
                    </span>
                  </div>
                )}
              </div>
            </div>

            {todo.steps.length > 0 && (
              <div className="space-y-2">
                {todo.steps.map((step) => (
                  <div key={step.id} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div className="flex items-center gap-2">
                      {step.completed ? (
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                      ) : (
                        <Clock className="w-4 h-4 text-gray-500" />
                      )}
                      <span className={cn(
                        "text-sm",
                        step.completed && "line-through text-gray-500"
                      )}>
                        {step.title}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add Todo Modal */}
      {showAddTodo && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="font-medium">Yeni Görev</h3>
              <button
                onClick={() => setShowAddTodo(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddTodo}>
              <div className="p-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Başlık</label>
                  <input
                    type="text"
                    name="title"
                    required
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Açıklama</label>
                  <textarea
                    name="description"
                    rows={3}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Öncelik</label>
                  <select
                    name="priority"
                    required
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700"
                  >
                    <option value="low">Düşük</option>
                    <option value="medium">Orta</option>
                    <option value="high">Yüksek</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Bitiş Tarihi</label>
                  <input
                    type="date"
                    name="dueDate"
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">Atanan Kişiler</label>
                  <div className="space-y-2 max-h-48 overflow-y-auto p-2 border border-gray-200 dark:border-gray-700 rounded-lg">
                    {users.map((user) => (
                      <label key={user.id} className="flex items-center gap-2 p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg cursor-pointer">
                        <input
                          type="checkbox"
                          name="assignedTo"
                          value={user.id}
                          className="w-4 h-4 rounded border-gray-300 text-primary-600"
                        />
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center">
                            <UserCircle className="w-5 h-5 text-primary-600" />
                          </div>
                          <div>
                            <p className="font-medium">{user.name}</p>
                            <p className="text-sm text-gray-500">{user.department || user.role}</p>
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="isPublic"
                      value="true"
                      className="w-4 h-4 rounded border-gray-300"
                    />
                    <span className="ml-2">Herkese Açık</span>
                  </label>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium">Alt Görevler</label>
                  </div>
                  <div className="space-y-2 mb-4">
                    {newTodoSteps.map((step, index) => (
                      <div
                        key={step.id}
                        className="flex items-center gap-2"
                      >
                        <input
                          type="text"
                          value={step.title}
                          onChange={(e) => handleStepChange(index, e.target.value)}
                          placeholder="Alt görev..."
                          className="flex-1 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveStep(index)}
                          className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/50 rounded-lg"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={handleAddStep}
                      className="w-full px-3 py-2 text-sm text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/50 rounded-lg border-2 border-dashed border-primary-200 dark:border-primary-800"
                    >
                      <Plus className="w-4 h-4 mx-auto" />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Ekler</label>
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-2 min-h-[100px] p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      {attachments.map((file, index) => (
                        <div
                          key={index}
                          className="relative group"
                        >
                          {file.type.startsWith('image/') ? (
                            <img
                              src={URL.createObjectURL(file)}
                              alt={file.name}
                              className="w-24 h-24 object-cover rounded-lg"
                            />
                          ) : (
                            <div className="w-24 h-24 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-lg">
                              <Image className="w-8 h-8 text-gray-400" />
                            </div>
                          )}
                          <button
                            type="button"
                            onClick={() => setAttachments(files => files.filter((_, i) => i !== index))}
                            className="absolute top-1 right-1 p-1 text-white bg-red-500 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileSelect}
                      className="hidden"
                      multiple
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full px-4 py-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 hover:border-primary-500 hover:text-primary-500 transition-colors"
                    >
                      Dosya Ekle
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 p-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setShowAddTodo(false)}
                  className="px-4 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  Oluştur
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Todo Detail Modal */}
      {selectedTodo && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex flex-col">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{selectedTodo.title}</h3>
                    <span className={cn(
                      'px-2 py-0.5 text-xs rounded-full',
                      priorityColors[selectedTodo.priority]
                    )}>
                      {selectedTodo.priority === 'low' ? 'Düşük' :
                       selectedTodo.priority === 'medium' ? 'Orta' : 'Yüksek'}
                    </span>
                  </div>
                  <button
                    onClick={() => setSelectedTodo(null)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                {/* Assigned Users */}
                {selectedTodo.assignedTo && selectedTodo.assignedTo.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {selectedTodo.assignedTo.map((userId) => {
                      const user = users.find(u => u.id === userId);
                      return user ? (
                        <div
                          key={userId}
                          className="flex items-center gap-2 px-3 py-1 bg-gray-100 dark:bg-gray-700 rounded-full"
                        >
                          <div className="w-6 h-6 rounded-full bg-primary-100 dark:bg-primary-900/50 flex items-center justify-center">
                            <UserCircle className="w-4 h-4 text-primary-600" />
                          </div>
                          <span className="text-sm">{user.name}</span>
                          {selectedTodo.completedAt && (
                            <span className="text-green-500 text-sm">
                              (Tamamlandı: {new Date(selectedTodo.completedAt).toLocaleDateString('tr-TR')})
                            </span>
                          )}
                        </div>
                      ) : null;
                    })}
                  </div>
                )}
              </div>
              <div className="p-4">
                {selectedTodo.description && (
                  <p className="text-gray-500 mb-4">{selectedTodo.description}</p>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  <div>
                    <p className="text-sm text-gray-500">Durum</p>
                    <select
                      value={selectedTodo.status}
                      onChange={(e) => updateTodo(selectedTodo.id, {
                        status: e.target.value as TodoStatus
                      })}
                      className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700"
                    >
                      <option value="pending">Bekliyor</option>
                      <option value="in-progress">Devam Ediyor</option>
                      <option value="completed">Tamamlandı</option>
                    </select>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">Bitiş Tarihi</p>
                    <input
                      type="date"
                      value={selectedTodo.dueDate?.split('T')[0]}
                      onChange={(e) => updateTodo(selectedTodo.id, {
                        dueDate: e.target.value
                      })}
                      className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700"
                    />
                  </div>
                </div>

                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium">Alt Görevler</p>
                    <button
                      onClick={() => {
                        const title = prompt('Alt görev başlığı:');
                        if (title) {
                          addStep(selectedTodo.id, { title, completed: false });
                        }
                      }}
                      className="text-sm text-primary-600 hover:text-primary-700"
                    >
                      + Yeni Alt Görev
                    </button>
                  </div>

                  <div className="space-y-2">
                    {selectedTodo.steps.map((step) => (
                      <div
                        key={step.id}
                        className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={step.completed}
                            onChange={(e) => {
                              updateStep(selectedTodo.id, step.id, e.target.checked);
                              if (e.target.checked && selectedTodo.steps.every(s => 
                                s.id === step.id ? true : s.completed
                              )) {
                                updateTodo(selectedTodo.id, {
                                  status: 'completed',
                                  completedAt: new Date().toISOString(),
                                  completedBy: user?.id
                                });
                              }
                            }}
                            className="w-5 h-5 rounded border-gray-300 text-green-500 focus:ring-green-500"
                          />
                          <span className={step.completed ? 'line-through text-gray-500' : ''}>
                            {step.title}
                          </span>
                          {step.completed && (
                            <CheckCircle2 className="w-5 h-5 text-green-500 ml-2" />
                          )}
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="file"
                            id={`step-file-${step.id}`}
                            className="hidden"
                            onChange={(e) => {
                              const files = Array.from(e.target.files || []);
                              setStepAttachments(prev => ({
                                ...prev,
                                [step.id]: [...(prev[step.id] || []), ...files]
                              }));
                            }}
                            multiple
                          />
                          <button
                            onClick={() => document.getElementById(`step-file-${step.id}`)?.click()}
                            className="p-1 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-600 rounded"
                            title="Dosya Ekle"
                          >
                            <Upload className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => deleteStep(selectedTodo.id, step.id)}
                            className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/50 rounded"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {selectedTodo.attachments && selectedTodo.attachments.length > 0 && (
                  <div className="flex flex-wrap gap-4 p-4 border-t border-gray-200 dark:border-gray-700">
                    {selectedTodo.attachments.map((attachment, index) => (
                      <div key={index} className="relative group w-24 sm:w-32">
                        {attachment.type.startsWith('image/') ? (
                          <img
                            src={attachment.url}
                            alt={attachment.name}
                            className="w-24 h-24 sm:w-32 sm:h-32 object-cover rounded-lg"
                          />
                        ) : (
                          <div className="w-24 h-24 sm:w-32 sm:h-32 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-lg">
                            <Image className="w-12 h-12 text-gray-400" />
                          </div>
                        )}
                        <a
                          href={attachment.url}
                          download={attachment.name}
                          className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"
                        >
                          <span className="text-white text-sm">İndir</span>
                        </a>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row justify-between p-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 mb-4 sm:mb-0">
                  <button
                    onClick={() => {
                      if (confirm('Bu görevi silmek istediğinizden emin misiniz?')) {
                        deleteTodo(selectedTodo.id);
                        setSelectedTodo(null);
                      }
                    }}
                    className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/50 rounded-lg"
                  >
                    Görevi Sil
                  </button>
                  {completionError && (
                    <p className="text-sm text-red-500">{completionError}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 justify-end">
                  {selectedTodo.status !== 'completed' && (
                    <button
                      onClick={() => handleCompleteTodo(selectedTodo)}
                      className="flex items-center gap-2 px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      <FileCheck className="w-4 h-4" />
                      <span>Tamamla</span>
                    </button>
                  )}
                  <button
                    onClick={() => setSelectedTodo(null)}
                    className="px-4 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                  >
                    Kapat
                  </button>
                </div>
              </div>
              
              {selectedTodo.completedAt && (
                <div className="mt-4 mx-4 mb-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <p className="text-green-600 dark:text-green-400">
                    <span className="font-medium">Tamamlayan:</span>{' '}
                    {users.find(u => u.id === selectedTodo.completedBy)?.name}
                  </p>
                  <p className="text-sm text-green-500 dark:text-green-400">
                    {new Date(selectedTodo.completedAt).toLocaleString('tr-TR')}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
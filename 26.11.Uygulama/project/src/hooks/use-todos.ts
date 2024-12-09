import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Todo, TodoStep } from '../types/todo';
import { useNotifications } from './use-notifications';

import { useAuth } from './use-auth';

interface TodosState {
  todos: Todo[];
  addTodo: (todo: Omit<Todo, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateTodo: (id: string, updates: Partial<Todo>) => void;
  deleteTodo: (id: string) => void;
  addStep: (todoId: string, step: Omit<TodoStep, 'id' | 'createdAt'>) => void;
  updateStep: (todoId: string, stepId: string, completed: boolean) => void;
  deleteStep: (todoId: string, stepId: string) => void;
  getTodosByUser: (userId: string) => Todo[];
  getAssignedTodos: (userId: string) => Todo[];
  getPublicTodos: () => Todo[];
}

export const useTodos = create<TodosState>()(
  persist(
    (set, get) => ({
      todos: [],

      addTodo: (todo) => {
        const { addNotification } = useNotifications.getState();
        const { user } = useAuth.getState();
        const newTodo: Todo = {
          ...todo,
          id: `TODO${Math.random().toString(36).substr(2, 9)}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          steps: todo.steps || [],
        };
        
        // Only notify assigned users
        if (newTodo.assignedTo) {
          newTodo.assignedTo.forEach(userId => {
            addNotification({
              type: 'system',
              title: 'Yeni Görev',
              message: `Size "${newTodo.title}" görevi atandı`,
              date: new Date().toISOString(),
              data: { todoId: newTodo.id },
              userId: userId,
            });
          });
        } else if (newTodo.isPublic && user?.id) {
          addNotification({
            type: 'system',
            title: 'Yeni Görev',
            message: `Yeni bir görev oluşturuldu: "${newTodo.title}"`,
            date: new Date().toISOString(),
            data: { todoId: newTodo.id },
            userId: user.id,
          });
        }

        set(state => ({
          todos: [newTodo, ...state.todos]
        }));
      },

      updateTodo: (id, updates) => {
        const { addNotification } = useNotifications.getState();
        const oldTodo = get().todos.find(t => t.id === id);
        
        set(state => ({
          todos: state.todos.map(todo =>
            todo.id === id
              ? { ...todo, ...updates, updatedAt: new Date().toISOString() }
              : todo
          )
        }));

        // Notify about assignment changes
        if (updates.assignedTo && oldTodo) {
          const newAssignees = updates.assignedTo.filter(id => !oldTodo.assignedTo?.includes(id));
          newAssignees.forEach(userId => {
            addNotification({
              type: 'system',
              title: 'Görev Atandı',
              message: `Size "${oldTodo.title}" görevi atandı`,
              date: new Date().toISOString(),
              data: { ...oldTodo, ...updates },
            });
          });
        }
      },

      deleteTodo: (id) => {
        set(state => ({
          todos: state.todos.filter(todo => todo.id !== id)
        }));
      },

      addStep: (todoId, step) => {
        const newStep: TodoStep = {
          ...step,
          id: `STEP${Math.random().toString(36).substr(2, 9)}`,
          createdAt: new Date().toISOString(),
        };

        set(state => ({
          todos: state.todos.map(todo =>
            todo.id === todoId
              ? { ...todo, steps: [...todo.steps, newStep] }
              : todo
          )
        }));
      },

      updateStep: (todoId, stepId, completed) => {
        const todo = get().todos.find(t => t.id === todoId);
        const { user } = useAuth.getState();
        if (!todo) return;
        
        const updatedSteps = todo.steps.map(step =>
          step.id === stepId
            ? {
                ...step,
                completed,
                completedAt: completed ? new Date().toISOString() : undefined
              }
            : step
        );
        
        const allStepsCompleted = updatedSteps.every(step => step.completed);

        set(state => ({
          todos: state.todos.map(todo =>
            todo.id === todoId
              ? {
                  ...todo,
                  status: allStepsCompleted ? 'completed' : 'in-progress',
                  steps: updatedSteps,
                  ...(allStepsCompleted ? {
                    completedAt: new Date().toISOString(),
                    completedBy: user?.id
                  } : {})
                }
              : todo
          )
        }));
      },

      deleteStep: (todoId, stepId) => {
        set(state => ({
          todos: state.todos.map(todo =>
            todo.id === todoId
              ? { ...todo, steps: todo.steps.filter(step => step.id !== stepId) }
              : todo
          )
        }));
      },

      getTodosByUser: (userId) => {
        return get().todos.filter(todo => 
          todo.createdBy === userId || 
          todo.isPublic || 
          todo.assignedTo?.includes(userId)
        );
      },

      getAssignedTodos: (userId) => {
        return get().todos.filter(todo => 
          todo.assignedTo?.includes(userId)
        );
      },

      getPublicTodos: () => {
        return get().todos.filter(todo => todo.isPublic);
      },
    }),
    {
      name: 'todos-storage',
      version: 1,
      migrate: (persistedState: any, version: number) => {
        if (version === 0) {
          return {
            ...persistedState,
            todos: persistedState.todos.map((todo: any) => ({
              ...todo,
              updatedAt: todo.updatedAt || todo.createdAt || new Date().toISOString()
            }))
          };
        }
        return persistedState;
      },
    }
  )
);
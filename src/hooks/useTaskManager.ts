import { useState, useEffect, useCallback } from 'react';
import { Task } from '@/types/task';
import { toast } from '@/hooks/use-toast';

const STORAGE_KEY = 'agenda-tasks';

export const useTaskManager = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Load tasks from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setTasks(JSON.parse(stored));
      } catch (error) {
        console.error('Error loading tasks:', error);
      }
    }
  }, []);

  // Save tasks to localStorage
  useEffect(() => {
    if (tasks.length >= 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    }
  }, [tasks]);

  const addTask = useCallback((task: Omit<Task, 'id' | 'createdAt' | 'completed' | 'notified'>) => {
    const newTask: Task = {
      ...task,
      id: crypto.randomUUID(),
      completed: false,
      notified: false,
      createdAt: new Date().toISOString(),
    };
    setTasks(prev => [newTask, ...prev]);
    toast({
      title: "Pendência criada!",
      description: "Sua pendência foi cadastrada com sucesso.",
    });
  }, []);

  const updateTask = useCallback((id: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(task => 
      task.id === id ? { ...task, ...updates } : task
    ));
    toast({
      title: "Pendência atualizada!",
      description: "As alterações foram salvas.",
    });
  }, []);

  const deleteTask = useCallback((id: string) => {
    setTasks(prev => prev.filter(task => task.id !== id));
    toast({
      title: "Pendência excluída!",
      description: "A pendência foi removida da agenda.",
      variant: "destructive",
    });
  }, []);

  const markAsNotified = useCallback((id: string) => {
    setTasks(prev => prev.map(task => 
      task.id === id ? { ...task, notified: true } : task
    ));
  }, []);

  const filteredTasks = tasks.filter(task => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      task.title.toLowerCase().includes(query) ||
      task.description.toLowerCase().includes(query)
    );
  });

  return {
    tasks: filteredTasks,
    allTasks: tasks,
    searchQuery,
    setSearchQuery,
    addTask,
    updateTask,
    deleteTask,
    markAsNotified,
  };
};

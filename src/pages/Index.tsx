import { useState } from 'react';
import { Search, Plus, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { TaskForm } from '@/components/TaskForm';
import { TaskList } from '@/components/TaskList';
import { AlarmModal } from '@/components/AlarmModal';
import { useTaskManager } from '@/hooks/useTaskManager';
import { useAlarmChecker } from '@/hooks/useAlarmChecker';
import { Task } from '@/types/task';

const Index = () => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>();
  const [alarmTask, setAlarmTask] = useState<Task | null>(null);
  const [isAlarmOpen, setIsAlarmOpen] = useState(false);

  const {
    tasks,
    allTasks,
    searchQuery,
    setSearchQuery,
    addTask,
    updateTask,
    deleteTask,
    markAsNotified,
  } = useTaskManager();

  useAlarmChecker({
    tasks: allTasks,
    onAlarm: (task) => {
      setAlarmTask(task);
      setIsAlarmOpen(true);
    },
    markAsNotified,
  });

  const handleSubmit = (taskData: Omit<Task, 'id' | 'createdAt' | 'completed' | 'notified'>) => {
    if (editingTask) {
      updateTask(editingTask.id, taskData);
      setEditingTask(undefined);
    } else {
      addTask(taskData);
    }
    setIsFormOpen(false);
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setIsFormOpen(true);
  };

  const handleCancel = () => {
    setEditingTask(undefined);
    setIsFormOpen(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header with gradient */}
      <header className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-lg">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center gap-3 mb-2">
            <Calendar className="h-8 w-8" />
            <h1 className="text-3xl font-bold">Minha Agenda</h1>
          </div>
          <p className="text-primary-foreground/90">
            Organize suas pendências e nunca perca um compromisso
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar pendências..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          
          <Dialog open={isFormOpen} onOpenChange={(open) => {
            setIsFormOpen(open);
            if (!open) setEditingTask(undefined);
          }}>
            <DialogTrigger asChild>
              <Button size="lg" className="gap-2">
                <Plus className="h-5 w-5" />
                Nova Pendência
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingTask ? 'Editar Pendência' : 'Nova Pendência'}
                </DialogTitle>
              </DialogHeader>
              <TaskForm
                onSubmit={handleSubmit}
                initialData={editingTask}
                onCancel={handleCancel}
              />
            </DialogContent>
          </Dialog>
        </div>

        {/* Tasks List */}
        <TaskList
          tasks={tasks}
          onEdit={handleEdit}
          onDelete={deleteTask}
        />
      </main>

      {/* Alarm Modal */}
      <AlarmModal
        task={alarmTask}
        open={isAlarmOpen}
        onClose={() => setIsAlarmOpen(false)}
      />

      {/* Footer */}
      <footer className="mt-16 py-6 border-t">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>Agenda com Alarmes • Desenvolvido com ❤️</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;

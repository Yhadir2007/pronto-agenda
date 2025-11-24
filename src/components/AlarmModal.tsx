import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Task } from '@/types/task';
import { Bell } from 'lucide-react';

interface AlarmModalProps {
  task: Task | null;
  open: boolean;
  onClose: () => void;
}

export const AlarmModal = ({ task, open, onClose }: AlarmModalProps) => {
  if (!task) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2 text-primary mb-2">
            <Bell className="h-6 w-6 animate-bounce" />
            <DialogTitle className="text-2xl">Lembrete!</DialogTitle>
          </div>
          <DialogDescription className="text-base">
            É hora da sua pendência
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {task.imageUrl && (
            <div className="w-full h-48 rounded-lg overflow-hidden bg-muted">
              <img 
                src={task.imageUrl} 
                alt={task.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          
          <div className="space-y-2">
            <h3 className="font-semibold text-xl">{task.title}</h3>
            <p className="text-muted-foreground">{task.description}</p>
          </div>
        </div>

        <div className="flex gap-2 mt-4">
          <Button onClick={onClose} className="flex-1">
            Entendi
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar, Clock, Edit2, Trash2, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Task } from '@/types/task';
import { cn } from '@/lib/utils';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

export const TaskCard = ({ task, onEdit, onDelete }: TaskCardProps) => {
  const taskDate = new Date(task.dateTime);
  const now = new Date();
  const isPast = taskDate < now;
  const isToday = format(taskDate, 'yyyy-MM-dd') === format(now, 'yyyy-MM-dd');

  return (
    <Card className={cn(
      "overflow-hidden transition-all hover:shadow-lg animate-fade-in",
      task.completed && "opacity-60"
    )}>
      {task.imageUrl && (
        <div className="w-full h-48 overflow-hidden bg-muted">
          <img 
            src={task.imageUrl} 
            alt={task.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      
      <CardHeader className="space-y-3 pb-3">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-semibold text-lg leading-tight flex-1">{task.title}</h3>
          {task.completed && (
            <Badge variant="secondary" className="gap-1">
              <CheckCircle2 className="h-3 w-3" />
              Concluída
            </Badge>
          )}
          {!task.completed && isPast && (
            <Badge variant="destructive">Atrasada</Badge>
          )}
          {!task.completed && isToday && !isPast && (
            <Badge className="bg-secondary">Hoje</Badge>
          )}
        </div>
        
        <p className="text-sm text-muted-foreground line-clamp-2">{task.description}</p>
      </CardHeader>

      <CardContent className="pb-3">
        <div className="flex flex-wrap gap-3 text-sm">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{format(taskDate, 'dd/MM/yyyy', { locale: ptBR })}</span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{format(taskDate, 'HH:mm')}</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-3 gap-2 border-t">
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={() => onEdit(task)}
        >
          <Edit2 className="h-4 w-4 mr-1" />
          Editar
        </Button>
        <Button
          variant="destructive"
          size="sm"
          onClick={() => onDelete(task.id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};

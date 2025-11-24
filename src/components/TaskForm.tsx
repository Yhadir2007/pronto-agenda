import { useState, useEffect, useRef } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { CalendarIcon, ImageIcon, Loader2, Upload, X } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { cn } from '@/lib/utils';
import { Task } from '@/types/task';
import { fileToBase64, validateImageFile, compressImage } from '@/utils/imageUtils';
import { toast } from '@/hooks/use-toast';

const taskSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório').max(100, 'Máximo 100 caracteres'),
  description: z.string().min(1, 'Descrição é obrigatória').max(500, 'Máximo 500 caracteres'),
  date: z.date({ required_error: 'Data é obrigatória' }),
  time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato inválido (HH:MM)'),
  imageUrl: z.string().optional().or(z.literal('')),
});

type TaskFormData = z.infer<typeof taskSchema>;

interface TaskFormProps {
  onSubmit: (task: Omit<Task, 'id' | 'createdAt' | 'completed' | 'notified'>) => void;
  initialData?: Task;
  onCancel?: () => void;
}

export const TaskForm = ({ onSubmit, initialData, onCancel }: TaskFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(initialData?.imageUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: initialData ? {
      title: initialData.title,
      description: initialData.description,
      date: new Date(initialData.dateTime),
      time: format(new Date(initialData.dateTime), 'HH:mm'),
      imageUrl: initialData.imageUrl || '',
    } : {
      title: '',
      description: '',
      time: '12:00',
      imageUrl: '',
    },
  });

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validar arquivo
    const validation = validateImageFile(file);
    if (!validation.valid) {
      toast({
        title: 'Erro na imagem',
        description: validation.error,
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsLoading(true);
      
      // Converter para base64
      let base64 = await fileToBase64(file);
      
      // Comprimir se necessário
      base64 = await compressImage(base64);
      
      // Atualizar preview e formulário
      setImagePreview(base64);
      form.setValue('imageUrl', base64);
      
      toast({
        title: 'Imagem carregada!',
        description: 'A imagem foi adicionada com sucesso.',
      });
    } catch (error) {
      toast({
        title: 'Erro ao carregar imagem',
        description: 'Tente novamente com outra imagem.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    form.setValue('imageUrl', '');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (data: TaskFormData) => {
    setIsLoading(true);
    
    // Combine date and time
    const dateTime = new Date(data.date);
    const [hours, minutes] = data.time.split(':');
    dateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

    onSubmit({
      title: data.title,
      description: data.description,
      dateTime: dateTime.toISOString(),
      imageUrl: data.imageUrl || undefined,
    });

    if (!initialData) {
      form.reset();
      setImagePreview(null);
    }
    
    setIsLoading(false);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Título</FormLabel>
              <FormControl>
                <Input placeholder="Digite o título da pendência" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Descreva os detalhes da pendência" 
                  className="min-h-[100px] resize-none"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Data</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          'w-full pl-3 text-left font-normal',
                          !field.value && 'text-muted-foreground'
                        )}
                      >
                        {field.value ? (
                          format(field.value, 'PPP', { locale: ptBR })
                        ) : (
                          <span>Selecione a data</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="time"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Horário</FormLabel>
                <FormControl>
                  <Input type="time" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="imageUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Imagem (opcional)</FormLabel>
              <FormControl>
                <div className="space-y-4">
                  {/* Preview da imagem */}
                  {imagePreview && (
                    <div className="relative w-full h-48 rounded-lg overflow-hidden bg-muted">
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        className="w-full h-full object-cover"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2"
                        onClick={handleRemoveImage}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                  
                  {/* Botão de upload */}
                  <div className="flex flex-col gap-2">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isLoading}
                      className="w-full"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      {imagePreview ? 'Trocar Imagem' : 'Carregar do Dispositivo'}
                    </Button>
                    <p className="text-xs text-muted-foreground text-center">
                      Formatos: JPG, PNG, GIF, WEBP • Máximo: 5MB
                    </p>
                  </div>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-3 pt-4">
          <Button 
            type="submit" 
            className="flex-1"
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {initialData ? 'Atualizar' : 'Criar'} Pendência
          </Button>
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
};

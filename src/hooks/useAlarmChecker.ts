import { useEffect, useRef } from 'react';
import { Task } from '@/types/task';

interface AlarmCheckerProps {
  tasks: Task[];
  onAlarm: (task: Task) => void;
  markAsNotified: (id: string) => void;
}

export const useAlarmChecker = ({ tasks, onAlarm, markAsNotified }: AlarmCheckerProps) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastCheckRef = useRef<Date>(new Date());

  useEffect(() => {
    // Create audio element
    audioRef.current = new Audio('/alarm.mp3');
    audioRef.current.loop = false;

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const checkAlarms = () => {
      const now = new Date();
      
      tasks.forEach(task => {
        if (task.completed || task.notified) return;

        const taskDateTime = new Date(task.dateTime);
        const timeDiff = taskDateTime.getTime() - now.getTime();

        // Check if alarm should trigger (within 1 minute window)
        if (timeDiff <= 0 && timeDiff > -60000) {
          console.log('Triggering alarm for task:', task.title);
          
          // Play alarm sound
          if (audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.play().catch(err => {
              console.error('Error playing alarm:', err);
            });
          }

          // Show notification
          onAlarm(task);
          markAsNotified(task.id);

          // Request browser notification permission
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('🔔 Lembrete da Agenda', {
              body: task.title,
              icon: task.imageUrl || '/placeholder.svg',
            });
          }
        }
      });

      lastCheckRef.current = now;
    };

    // Check every 1 second for more accurate alarm triggering
    const interval = setInterval(checkAlarms, 1000);
    
    // Check immediately
    checkAlarms();

    return () => clearInterval(interval);
  }, [tasks, onAlarm, markAsNotified]);

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  return null;
};

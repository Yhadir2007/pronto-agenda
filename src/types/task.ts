export interface Task {
  id: string;
  title: string;
  description: string;
  dateTime: string;
  imageUrl?: string;
  completed: boolean;
  notified: boolean;
  createdAt: string;
}

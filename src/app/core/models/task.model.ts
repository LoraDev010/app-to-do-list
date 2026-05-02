export type Priority = 'high' | 'medium' | 'low';

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  categoryId: string | null;
  priority: Priority | null;
  createdAt: number;
  completedAt?: number;
}

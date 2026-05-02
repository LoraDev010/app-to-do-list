import { Injectable, computed, signal } from '@angular/core';
import { Task, Priority } from '../models/task.model';
import { StorageService } from './storage.service';

const TASKS_KEY = 'tasks';

@Injectable({ providedIn: 'root' })
export class TaskService {
  private readonly _tasks = signal<Task[]>([]);
  private readonly _activeFilter = signal<string | null>(null);

  readonly tasks = this._tasks.asReadonly();
  readonly activeFilter = this._activeFilter.asReadonly();

  readonly filteredTasks = computed(() => {
    const filter = this._activeFilter();
    const tasks = this._tasks();
    if (!filter) return tasks;
    return tasks.filter(t => t.categoryId === filter);
  });

  readonly pendingCount = computed(() => this._tasks().filter(t => !t.completed).length);

  constructor(private storage: StorageService) {
    this.loadFromStorage();
  }

  private async loadFromStorage(): Promise<void> {
    const saved = await this.storage.get<Task[]>(TASKS_KEY);
    if (saved) this._tasks.set(saved);
  }

  private async persist(): Promise<void> {
    await this.storage.set(TASKS_KEY, this._tasks());
  }

  setFilter(categoryId: string | null): void {
    this._activeFilter.set(categoryId);
  }

  async add(title: string, categoryId: string | null, priority: Priority | null): Promise<Task> {
    const task: Task = {
      id: crypto.randomUUID(),
      title: title.trim(),
      completed: false,
      categoryId,
      priority,
      createdAt: Date.now(),
    };
    this._tasks.update(list => [task, ...list]);
    await this.persist();
    return task;
  }

  async toggle(id: string): Promise<void> {
    this._tasks.update(list =>
      list.map(t =>
        t.id === id
          ? { ...t, completed: !t.completed, completedAt: !t.completed ? Date.now() : undefined }
          : t
      )
    );
    await this.persist();
  }

  async update(id: string, title: string, categoryId: string | null, priority: Priority | null): Promise<void> {
    this._tasks.update(list =>
      list.map(t => (t.id === id ? { ...t, title: title.trim(), categoryId, priority } : t))
    );
    await this.persist();
  }

  async remove(id: string): Promise<void> {
    this._tasks.update(list => list.filter(t => t.id !== id));
    await this.persist();
  }
}

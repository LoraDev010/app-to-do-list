import { Injectable, computed, signal } from '@angular/core';
import { ToastController } from '@ionic/angular/standalone';
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

  constructor(private storage: StorageService, private toastCtrl: ToastController) {
    this.loadFromStorage();
  }

  private async loadFromStorage(): Promise<void> {
    try {
      const saved = await this.storage.get<Task[]>(TASKS_KEY);
      if (saved) this._tasks.set(saved);
    } catch {
      await this.showError('Error al cargar las tareas');
    }
  }

  private async persist(): Promise<void> {
    await this.storage.set(TASKS_KEY, this._tasks());
  }

  private async showError(message: string): Promise<void> {
    const toast = await this.toastCtrl.create({
      message,
      duration: 3000,
      color: 'danger',
      position: 'bottom',
    });
    await toast.present();
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
    try {
      this._tasks.update(list => [task, ...list]);
      await this.persist();
    } catch {
      this._tasks.update(list => list.filter(t => t.id !== task.id));
      await this.showError('Error al guardar la tarea');
    }
    return task;
  }

  async toggle(id: string): Promise<void> {
    const previous = this._tasks();
    try {
      this._tasks.update(list =>
        list.map(t =>
          t.id === id
            ? { ...t, completed: !t.completed, completedAt: !t.completed ? Date.now() : undefined }
            : t
        )
      );
      await this.persist();
    } catch {
      this._tasks.set(previous);
      await this.showError('Error al actualizar la tarea');
    }
  }

  async update(id: string, title: string, categoryId: string | null, priority: Priority | null): Promise<void> {
    const previous = this._tasks();
    try {
      this._tasks.update(list =>
        list.map(t => (t.id === id ? { ...t, title: title.trim(), categoryId, priority } : t))
      );
      await this.persist();
    } catch {
      this._tasks.set(previous);
      await this.showError('Error al editar la tarea');
    }
  }

  async remove(id: string): Promise<void> {
    const previous = this._tasks();
    try {
      this._tasks.update(list => list.filter(t => t.id !== id));
      await this.persist();
    } catch {
      this._tasks.set(previous);
      await this.showError('Error al eliminar la tarea');
    }
  }

  clearCategoryFromTasks(categoryId: string): void {
    this._tasks.update(list =>
      list.map(t => (t.categoryId === categoryId ? { ...t, categoryId: null } : t))
    );
    this.persist();
  }
}

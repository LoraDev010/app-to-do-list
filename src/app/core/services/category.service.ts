import { Injectable, signal } from '@angular/core';
import { ToastController } from '@ionic/angular/standalone';
import { Category } from '../models/category.model';
import { StorageService } from './storage.service';

const CATEGORIES_KEY = 'categories';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private readonly _categories = signal<Category[]>([]);

  readonly categories = this._categories.asReadonly();

  constructor(private storage: StorageService, private toastCtrl: ToastController) {
    this.loadFromStorage();
  }

  private async loadFromStorage(): Promise<void> {
    try {
      const saved = await this.storage.get<Category[]>(CATEGORIES_KEY);
      if (saved) this._categories.set(saved);
    } catch {
      await this.showError('Error al cargar las categorías');
    }
  }

  private async persist(): Promise<void> {
    await this.storage.set(CATEGORIES_KEY, this._categories());
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

  async add(name: string, color: string): Promise<Category> {
    const category: Category = {
      id: crypto.randomUUID(),
      name: name.trim(),
      color,
      createdAt: Date.now(),
    };
    try {
      this._categories.update(list => [...list, category]);
      await this.persist();
    } catch {
      this._categories.update(list => list.filter(c => c.id !== category.id));
      await this.showError('Error al guardar la categoría');
    }
    return category;
  }

  async update(id: string, name: string, color: string): Promise<void> {
    const previous = this._categories();
    try {
      this._categories.update(list =>
        list.map(c => (c.id === id ? { ...c, name: name.trim(), color } : c))
      );
      await this.persist();
    } catch {
      this._categories.set(previous);
      await this.showError('Error al editar la categoría');
    }
  }

  async remove(id: string): Promise<void> {
    const previous = this._categories();
    try {
      this._categories.update(list => list.filter(c => c.id !== id));
      await this.persist();
    } catch {
      this._categories.set(previous);
      await this.showError('Error al eliminar la categoría');
    }
  }

  nameExists(name: string, excludeId?: string): boolean {
    return this._categories().some(
      c => c.name.toLowerCase() === name.trim().toLowerCase() && c.id !== excludeId
    );
  }

  getById(id: string): Category | undefined {
    return this._categories().find(c => c.id === id);
  }
}

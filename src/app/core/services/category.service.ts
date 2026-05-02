import { Injectable, signal } from '@angular/core';
import { Category } from '../models/category.model';
import { StorageService } from './storage.service';

const CATEGORIES_KEY = 'categories';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private readonly _categories = signal<Category[]>([]);

  readonly categories = this._categories.asReadonly();

  constructor(private storage: StorageService) {
    this.loadFromStorage();
  }

  private async loadFromStorage(): Promise<void> {
    const saved = await this.storage.get<Category[]>(CATEGORIES_KEY);
    if (saved) this._categories.set(saved);
  }

  private async persist(): Promise<void> {
    await this.storage.set(CATEGORIES_KEY, this._categories());
  }

  async add(name: string, color: string): Promise<Category> {
    const category: Category = {
      id: crypto.randomUUID(),
      name: name.trim(),
      color,
      createdAt: Date.now(),
    };
    this._categories.update(list => [...list, category]);
    await this.persist();
    return category;
  }

  async update(id: string, name: string, color: string): Promise<void> {
    this._categories.update(list =>
      list.map(c => (c.id === id ? { ...c, name: name.trim(), color } : c))
    );
    await this.persist();
  }

  async remove(id: string): Promise<void> {
    this._categories.update(list => list.filter(c => c.id !== id));
    await this.persist();
  }

  getById(id: string): Category | undefined {
    return this._categories().find(c => c.id === id);
  }
}

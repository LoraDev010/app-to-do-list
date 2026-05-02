import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';

@Injectable({ providedIn: 'root' })
export class StorageService {
  private initialized = false;

  constructor(private storage: Storage) {}

  async init(): Promise<void> {
    if (!this.initialized) {
      await this.storage.create();
      this.initialized = true;
    }
  }

  async get<T>(key: string): Promise<T | null> {
    await this.init();
    return this.storage.get(key);
  }

  async set<T>(key: string, value: T): Promise<void> {
    await this.init();
    await this.storage.set(key, value);
  }

  async remove(key: string): Promise<void> {
    await this.init();
    await this.storage.remove(key);
  }
}

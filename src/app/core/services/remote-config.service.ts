import { Injectable, signal } from '@angular/core';
import { initializeApp, getApps } from 'firebase/app';
import { getRemoteConfig, fetchAndActivate, getValue } from 'firebase/remote-config';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class RemoteConfigService {
  readonly enableTaskPriority = signal(false);

  async initialize(): Promise<void> {
    if (!environment.firebase.apiKey) return;

    try {
      const app = getApps().length ? getApps()[0] : initializeApp(environment.firebase);
      const remoteConfig = getRemoteConfig(app);

      remoteConfig.defaultConfig = { enable_task_priority: false };
      remoteConfig.settings.minimumFetchIntervalMillis = environment.production
        ? 43_200_000
        : 0;

      await fetchAndActivate(remoteConfig);
      this.enableTaskPriority.set(getValue(remoteConfig, 'enable_task_priority').asBoolean());
    } catch {
      // Firebase not configured — use defaults
    }
  }
}

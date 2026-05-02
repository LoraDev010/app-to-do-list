import { bootstrapApplication } from '@angular/platform-browser';
import { PreloadAllModules, RouteReuseStrategy, provideRouter, withPreloading } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';
import { importProvidersFrom } from '@angular/core';
import { IonicStorageModule } from '@ionic/storage-angular';

import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';
import { RemoteConfigService } from './app/core/services/remote-config.service';

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular({ mode: 'md' }),
    provideRouter(routes, withPreloading(PreloadAllModules)),
    importProvidersFrom(IonicStorageModule.forRoot()),
    {
      provide: 'APP_INIT',
      useFactory: (rc: RemoteConfigService) => rc.initialize(),
      deps: [RemoteConfigService],
    },
  ],
}).catch(err => console.error(err));

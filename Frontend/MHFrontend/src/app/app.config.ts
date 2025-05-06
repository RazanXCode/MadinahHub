import { ApplicationConfig, provideZoneChangeDetection, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideHttpClient, withInterceptors, withInterceptorsFromDi } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { providePrimeNG } from 'primeng/config';
import { MyPreset } from '../assets/themes/mytheme';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { authInterceptor } from './interceptors/auth-interceptor';
import { AuthService } from './services/auth.service';
import { UserService } from './services/users/users.service';

export const appConfig: ApplicationConfig = {
  providers: [    providePrimeNG({
    theme: {
      preset: MyPreset,
      options: {
        prefix: 'p',
        darkModeSelector: '.dark',
        cssLayer: {
          name: 'primeng',
          order: 'theme, base, primeng',
        },
      },
    },
  }),
  provideZoneChangeDetection({ eventCoalescing: true }), provideRouter(routes),
  provideRouter(routes),
  provideAnimationsAsync(),
  importProvidersFrom(ReactiveFormsModule),
  provideHttpClient(withInterceptors([authInterceptor]))

  ],
};

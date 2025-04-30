import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { providePrimeNG } from 'primeng/config';
import { MyPreset } from '../assets/themes/mytheme';
import { provideHttpClient, withFetch } from '@angular/common/http';

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
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideClientHydration(withEventReplay()),
    provideHttpClient(withFetch()),
  ],
};

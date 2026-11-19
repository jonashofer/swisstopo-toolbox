import { enableProdMode, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { HTTP_INTERCEPTORS, provideHttpClient, withFetch } from '@angular/common/http';
import { AppComponent } from './app/app.component';
import { AppRoutes } from './app/app-routing.module';
import { environment } from './environments/environment';
import { SharedStandaloneModule } from './app/shared/shared-standalone.module';
import { provideObliqueConfiguration, ObHttpApiInterceptor } from '@oblique/oblique';

if (environment.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, {
  providers: [
    provideZoneChangeDetection(),
    importProvidersFrom(SharedStandaloneModule),
    provideHttpClient(withFetch()),
    provideRouter(AppRoutes),
    provideObliqueConfiguration({
      accessibilityStatement: {
        createdOn: new Date('2026-11-19'),
        conformity: 'none',
        applicationName: 'Swisstopo Toolbox',
        applicationOperator: '3rd Party',
        contact: [{ url: 'https://github.com/jonashofer/swisstopo-toolbox/issues' }]
      },
      banner: environment.banner ?? undefined,
      translate: {
        locales: { locales: ['de-CH', 'fr-CH', 'it-CH', 'rm', 'en-CH'] }
      }
    }),
    { provide: HTTP_INTERCEPTORS, useClass: ObHttpApiInterceptor, multi: true }
  ]
}).catch(err => console.error(err));

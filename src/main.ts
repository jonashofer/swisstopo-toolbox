import { enableProdMode, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { HTTP_INTERCEPTORS, provideHttpClient, withFetch } from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppComponent } from './app/app.component';
import { AppRoutes } from './app/app-routing.module';
import { environment } from './environments/environment';
import { SharedStandaloneModule } from './app/shared/shared-standalone.module';
import { provideObliqueConfiguration, OB_BANNER, ObHttpApiInterceptor } from '@oblique/oblique';

if (environment.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, {
  providers: [
    provideZoneChangeDetection(),
    importProvidersFrom(SharedStandaloneModule),
    importProvidersFrom(BrowserAnimationsModule),
    provideHttpClient(withFetch()),
    provideRouter(AppRoutes),
    provideObliqueConfiguration({
      accessibilityStatement: {
        createdOn: new Date('2026-08-04'),
        conformity: 'none',
        applicationName: 'Swisstopo Toolbox',
        applicationOperator: '3rd Party',
        contact: [{ email: '' }, { phone: '' }]
      }
    }),
    { provide: OB_BANNER, useValue: environment.banner },
    { provide: HTTP_INTERCEPTORS, useClass: ObHttpApiInterceptor, multi: true }
  ]
}).catch(err => console.error(err));

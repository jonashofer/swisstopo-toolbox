// src/main.ts
import { enableProdMode, importProvidersFrom } from '@angular/core';
import { bootstrapApplication }                 from '@angular/platform-browser';
import { provideRouter }                        from '@angular/router';
import { provideHttpClient, withFetch }         from '@angular/common/http';
import { BrowserAnimationsModule }              from '@angular/platform-browser/animations';
import { TranslateModule }                      from '@ngx-translate/core';

import { AppComponent }                         from './app/app.component';
import { AppRoutes }                            from './app/app-routing.module';
import { environment }                          from './environments/environment';
import { SharedStandaloneModule } from './app/shared/shared-standalone.module';

if (environment.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, {
  providers: [
    importProvidersFrom(SharedStandaloneModule),
    importProvidersFrom(BrowserAnimationsModule),
    importProvidersFrom(TranslateModule.forRoot()),
    provideHttpClient(withFetch()),
    provideRouter(AppRoutes),
  ]
}).catch(err => console.error(err));

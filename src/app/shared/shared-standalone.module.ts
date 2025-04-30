// src/shared/shared-standalone.module.ts
import { NgModule }                          from '@angular/core';
import { CommonModule }                      from '@angular/common';
import { FormsModule, ReactiveFormsModule }  from '@angular/forms';
import { ClipboardModule }                   from '@angular/cdk/clipboard';
import { DragDropModule }                    from '@angular/cdk/drag-drop';

import { TranslateModule }                   from '@ngx-translate/core';
import {
	ObAlertModule,
	ObAutocompleteModule,
	ObButtonModule,
	ObFileUploadModule,
	ObHttpApiInterceptor,
	ObHttpApiInterceptorConfig,
	ObInputClearModule,
	ObMasterLayoutConfig,
	ObMasterLayoutModule,
	ObMasterLayoutService,
	ObNotificationModule,
	ObPopoverModule,
	ObSpinnerModule,
	provideObliqueConfiguration,
	OB_BANNER,
	ObENotificationType,
  } from '@oblique/oblique';

// Angular Material (deep imports)
import { MatButtonModule }                   from '@angular/material/button';
import { MatButtonToggleModule }             from '@angular/material/button-toggle';
import { MatCardModule }                     from '@angular/material/card';
import { MatDialogModule }                   from '@angular/material/dialog';
import { MatFormFieldModule }                from '@angular/material/form-field';
import { MatIconModule }                     from '@angular/material/icon';
import { MatInputModule }                    from '@angular/material/input';
import { MatListModule }                     from '@angular/material/list';
import { MatMenuModule }                     from '@angular/material/menu';
import { MatProgressBarModule }              from '@angular/material/progress-bar';
import { MatProgressSpinnerModule }          from '@angular/material/progress-spinner';
import { MatTabsModule }                     from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule }                  from '@angular/material/tooltip';
import { MatRippleModule } from '@angular/material/core';

import { MatAutocompleteModule} from '@angular/material/autocomplete';

import { HTTP_INTERCEPTORS }                 from '@angular/common/http';
import { environment }                       from '../../environments/environment';

@NgModule({
  imports: [
    // Angular
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ClipboardModule,
    DragDropModule,
    // 3rd-party
    TranslateModule,
    // Oblique modules
    ObMasterLayoutModule,
    ObFileUploadModule,
    ObButtonModule,
    ObSpinnerModule,
    ObAutocompleteModule,
    ObInputClearModule,
    ObNotificationModule,
    ObPopoverModule,
    ObAlertModule,
    // Material modules
    MatButtonModule,
    MatButtonToggleModule,
    MatCardModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatMenuModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatTabsModule,
    MatTooltipModule,
		MatAutocompleteModule,
		MatRippleModule,
		MatTableModule
  ],
  exports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ClipboardModule,
    DragDropModule,
    TranslateModule,
    ObMasterLayoutModule,
    ObFileUploadModule,
    ObButtonModule,
    ObSpinnerModule,
    ObAutocompleteModule,
    ObInputClearModule,
    ObNotificationModule,
    ObPopoverModule,
    ObAlertModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatCardModule,
    MatDialogModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatMenuModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatTabsModule,
    MatTooltipModule,
		MatAutocompleteModule,
		MatRippleModule,
		MatTableModule
  ],
  providers: [
    provideObliqueConfiguration({
      accessibilityStatement: {
        applicationName: 'My App',
        applicationOperator: 'Federal Office, Address…',
        contact: { emails: [''], phones: [''] }
      }
    }),
    { provide: OB_BANNER, useValue: environment.banner },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ObHttpApiInterceptor,
      multi: true
    }
  ]
})
export class SharedStandaloneModule {
  constructor(
    masterConfig: ObMasterLayoutConfig,
    interceptorConfig: ObHttpApiInterceptorConfig
  ) {
    masterConfig.header.isSmall   = true;
    masterConfig.homePageRoute    = '/address-to-coordinate';
    masterConfig.locale.locales.push('rm-CH', 'en-CH');
    masterConfig.locale.defaultLanguage = 'de-CH';

    interceptorConfig.api.spinner              = false;
    interceptorConfig.api.notification.severity = ObENotificationType.WARNING;
    interceptorConfig.api.notification.title    = 'apiError.title';
    interceptorConfig.api.notification.text     = 'apiError.description';
  }
}

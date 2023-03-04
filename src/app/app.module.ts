import { LOCALE_ID, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import {
  OB_BANNER,
  ObAlertModule,
  ObButtonModule,
  ObENotificationType,
  ObFileUploadModule,
  ObHttpApiInterceptor,
  ObHttpApiInterceptorConfig,
  ObIconModule,
  ObInputClearModule,
  ObMasterLayoutConfig,
  ObMasterLayoutModule,
  ObNotificationModule,
  ObPopoverModule,
  ObSpinnerModule,
  multiTranslateLoader,
  ObAutocompleteModule
} from '@oblique/oblique';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DecimalPipe, registerLocaleData } from '@angular/common';
import localeDECH from '@angular/common/locales/de-CH';
import localeFRCH from '@angular/common/locales/fr-CH';
import localeITCH from '@angular/common/locales/it-CH';
import localeRM from '@angular/common/locales/rm';
import localeENCH from '@angular/common/locales/en-CH';
import { DragDropModule } from '@angular/cdk/drag-drop';
import {MatListModule} from '@angular/material/list';
import { HTTP_INTERCEPTORS, HttpClient, HttpClientModule } from '@angular/common/http';
import { TranslateModule } from '@ngx-translate/core';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';
import { MatLegacyTabsModule as MatTabsModule } from '@angular/material/legacy-tabs';
import { MatLegacyAutocompleteModule as MatAutocompleteModule } from '@angular/material/legacy-autocomplete';
import { AddressToCoordinateComponent } from './address-to-coordinate/address-to-coordinate.component';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { AddressCoordinateTableComponent } from './address-to-coordinate/components/address-coordinate-table/address-coordinate-table.component';
import { MatLegacyTableModule as MatTableModule } from '@angular/material/legacy-table';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyMenuModule as MatMenuModule } from '@angular/material/legacy-menu';

import { ObIAutocompleteInputOption, ObIAutocompleteInputOptionGroup, OptionLabelIconPosition } from '@oblique/oblique';
import {
  MatLegacyDialogActions as MatDialogActions,
  MatLegacyDialogModule as MatDialogModule
} from '@angular/material/legacy-dialog';
import { ResultMapComponent } from './address-to-coordinate/components/result-map/result-map.component';
import { AddressSearchInputComponent } from './address-to-coordinate/components/address-search-input/address-search-input.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatLegacyProgressSpinnerModule as MatProgressSpinnerModule } from '@angular/material/legacy-progress-spinner';
import { CoordinateSystemSwitchComponent } from './address-to-coordinate/components/coordinate-system-switch/coordinate-system-switch.component';
import { AddressService, ApiService, CoordinateService, DownloadService } from './address-to-coordinate/services';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';
import { CoordinatePipe } from './address-to-coordinate/components/coordinate.pipe';
import { DownloadSelectorComponent } from './address-to-coordinate/components/download-selector/download-selector.component';
import { GuideComponent } from './guide/guide.component';
import { MarkdownModule, MarkedOptions } from 'ngx-markdown';
import { FileUploadInputComponent } from './address-to-coordinate/components/file-upload-input/file-upload-input.component';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { ToolbarComponent } from './address-to-coordinate/components/toolbar/toolbar.component';
import { environment } from 'src/environments/environment';
import { ColumnConfigDialogComponent } from './address-to-coordinate/components/column-config-dialog/column-config-dialog.component';

registerLocaleData(localeDECH);
registerLocaleData(localeFRCH);
registerLocaleData(localeITCH);
registerLocaleData(localeRM);
registerLocaleData(localeENCH);

@NgModule({
  declarations: [
    AppComponent,
    AddressToCoordinateComponent,
    AddressCoordinateTableComponent,
    ResultMapComponent,
    AddressSearchInputComponent,
    CoordinateSystemSwitchComponent,
    DownloadSelectorComponent,
    CoordinatePipe,
    GuideComponent,
    FileUploadInputComponent,
    ToolbarComponent,
    ColumnConfigDialogComponent
  ],
  imports: [
    MatListModule,
    DragDropModule,
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    MatDialogModule,
    ObIconModule.forRoot(),
    ObMasterLayoutModule,
    ObFileUploadModule,
    ObButtonModule,
    ObSpinnerModule,
    ObButtonModule,
    ObAutocompleteModule,
    ObInputClearModule,
    ObNotificationModule,
    ObPopoverModule,
    MatProgressSpinnerModule,
    MatTabsModule,
    MatFormFieldModule,
    MatAutocompleteModule,
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    MatButtonToggleModule,
    BrowserAnimationsModule,
    HttpClientModule,
    TranslateModule.forRoot(multiTranslateLoader()),
    MatButtonModule,
    MatCardModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatTooltipModule,
    MatMenuModule,
    MarkdownModule.forRoot({
      loader: HttpClient,
      markedOptions: {
        provide: MarkedOptions,
        useValue: {
          baseUrl: '/assets/cookbook/'
        }
      }
    }),
    ObAlertModule,
    ClipboardModule
  ],
  providers: [
    { provide: LOCALE_ID, useValue: 'de-CH' },
    { provide: HTTP_INTERCEPTORS, useClass: ObHttpApiInterceptor, multi: true },
    {
      provide: OB_BANNER,
      useValue: {
        text: 'BFH',
        color: '#FFCB05',
        bgColor: '#37556E'
      }
    },
    AddressService,
    ApiService,
    CoordinateService,
    DownloadService,
    DecimalPipe,
    CoordinatePipe,
    MatDialogActions
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(masterConfig: ObMasterLayoutConfig, interceptorConfig: ObHttpApiInterceptorConfig) {
    masterConfig.header.isSmall = true;
    masterConfig.homePageRoute = '/address-to-coordinate';

    // NOTE: this leads to initial error because oblique tries to load its RM file which does not exist
    masterConfig.locale.locales.push('rm-CH');
    masterConfig.locale.locales.push('en-CH');

    interceptorConfig.api.spinner = false; // deactivate global spinner
    interceptorConfig.api.notification.severity = ObENotificationType.WARNING;
  }
}

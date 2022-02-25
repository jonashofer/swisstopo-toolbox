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
  multiTranslateLoader
} from '@oblique/oblique';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DecimalPipe, registerLocaleData } from '@angular/common';
import localeDECH from '@angular/common/locales/de-CH';
import localeFRCH from '@angular/common/locales/fr-CH';
import localeITCH from '@angular/common/locales/it-CH';
import localeRM from '@angular/common/locales/rm';
import localeENCH from '@angular/common/locales/en-CH';
import { HTTP_INTERCEPTORS, HttpClient, HttpClientModule } from '@angular/common/http';
import { TranslateModule } from '@ngx-translate/core';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { AddressToCoordinateComponent } from './address-to-coordinate/address-to-coordinate.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { AddressCoordinateTableComponent } from './address-to-coordinate/components/address-coordinate-table/address-coordinate-table.component';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialogActions, MatDialogModule } from '@angular/material/dialog';
import { ResultMapComponent } from './address-to-coordinate/components/result-map/result-map.component';
import { AddressSearchInputComponent } from './address-to-coordinate/components/address-search-input/address-search-input.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CoordinateSystemSwitchComponent } from './address-to-coordinate/components/coordinate-system-switch/coordinate-system-switch.component';
import { AddressService, ApiService, CoordinateService, DownloadService } from './address-to-coordinate/services';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CoordinatePipe } from './address-to-coordinate/components/coordinate.pipe';
import { DownloadSelectorComponent } from './address-to-coordinate/components/download-selector/download-selector.component';
import { GuideComponent } from './guide/guide.component';
import { MarkdownModule, MarkedOptions } from 'ngx-markdown';
import { FileUploadInputComponent } from './address-to-coordinate/components/file-upload-input/file-upload-input.component';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { ToolbarComponent } from './address-to-coordinate/components/toolbar/toolbar.component';
import { environment } from 'src/environments/environment';

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
    ToolbarComponent
  ],
  imports: [
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

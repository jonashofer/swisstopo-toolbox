import { APP_INITIALIZER, LOCALE_ID, NgModule } from '@angular/core';
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
  ObAutocompleteModule,
  ObMasterLayoutService
} from '@oblique/oblique';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { registerLocaleData } from '@angular/common';
import localeDECH from '@angular/common/locales/de-CH';
import localeFRCH from '@angular/common/locales/fr-CH';
import localeITCH from '@angular/common/locales/it-CH';
import localeRM from '@angular/common/locales/rm';
import localeENCH from '@angular/common/locales/en-CH';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatListModule } from '@angular/material/list';
import { HTTP_INTERCEPTORS, HttpClient, provideHttpClient, withFetch} from '@angular/common/http';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MatButtonModule as MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule as MatCardModule } from '@angular/material/card';
import { MatTabsModule as MatTabsModule } from '@angular/material/tabs';
import { MatAutocompleteModule as MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatFormFieldModule as MatFormFieldModule } from '@angular/material/form-field';
import { ResultTableComponent } from './shared/components/result-table/result-table.component';
import { MatTableModule as MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule as MatMenuModule } from '@angular/material/menu';

import {
  MatDialogActions as MatDialogActions,
  MatDialogModule as MatDialogModule
} from '@angular/material/dialog';
import { ResultMapComponent } from './shared/components/result-map/result-map.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule as MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule as MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule as MatProgressBarModule } from '@angular/material/progress-bar';
import { CoordinateSystemSwitchComponent } from './shared/components/coordinate-system-switch/coordinate-system-switch.component';
import { MatTooltipModule as MatTooltipModule } from '@angular/material/tooltip';
import { CoordinatePipe } from './shared/components/coordinate.pipe';
import { DownloadSelectorComponent } from './shared/components/download-selector/download-selector.component';
import { FileUploadInputComponent } from './shared/components/file-upload-input/file-upload-input.component';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { ToolbarComponent } from './shared/components/toolbar/toolbar.component';
import { ColumnConfigDialogComponent } from './shared/components/column-config-dialog/column-config-dialog.component';
import { TextInputComponent } from './shared/components/text-input/text-input.component';
import { SearchInputComponent } from './shared/components/search-input/search-input.component';
import { MatRippleModule } from '@angular/material/core';
import { FeatureTabComponent } from './shared/components/feature-tab/feature-tab.component';
import {
  AddressToCoordinateComponent,
  AddressToEgidComponent,
  AddressToHeightComponent,
  CoordinateToAddressComponent,
  CoordinateToCoordinateComponent,
  CoordinateToHeightComponent,
  EgidToAddressComponent
} from './feature-components';
import { ActivatedRoute } from '@angular/router';
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
    AddressToEgidComponent,
    AddressToHeightComponent,
    CoordinateToCoordinateComponent,
    CoordinateToHeightComponent,
    EgidToAddressComponent,
    SearchInputComponent,
    ResultTableComponent,
    ResultMapComponent,
    TextInputComponent,
    CoordinateSystemSwitchComponent,
    DownloadSelectorComponent,
    CoordinatePipe,
    FileUploadInputComponent,
    ToolbarComponent,
    ColumnConfigDialogComponent,
    CoordinateToAddressComponent,
    FeatureTabComponent
  ],
  imports: [
    MatRippleModule,
    MatListModule,
    DragDropModule,
    BrowserModule,
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
    MatProgressBarModule,
    MatButtonToggleModule,
    BrowserAnimationsModule,
    TranslateModule.forRoot(multiTranslateLoader()),
    MatButtonModule,
    MatCardModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatTooltipModule,
    MatMenuModule,
    ObAlertModule,
    ClipboardModule
  ],
  providers: [
    { provide: LOCALE_ID, useValue: 'de-CH' },
    {
      provide: APP_INITIALIZER,
      useFactory: initializeApp,
      multi: true,
      deps: [ActivatedRoute, ObMasterLayoutService, TranslateService]
    },
    { provide: HTTP_INTERCEPTORS, useClass: ObHttpApiInterceptor, multi: true },
    {
      provide: OB_BANNER,
      useValue: environment.banner
    },
    MatDialogActions,
    provideHttpClient(withFetch()),
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
  constructor(masterConfig: ObMasterLayoutConfig, interceptorConfig: ObHttpApiInterceptorConfig) {
    masterConfig.header.isSmall = true;
    masterConfig.header.reduceOnScroll = false;
    masterConfig.footer.hasLogoOnScroll = false;
    masterConfig.homePageRoute = '/address-to-coordinate';

    masterConfig.locale.locales.push('rm-CH');
    masterConfig.locale.locales.push('en-CH');
    masterConfig.locale.defaultLanguage = 'de-CH';

    interceptorConfig.api.spinner = false; // deactivate global spinner
    interceptorConfig.api.notification.severity = ObENotificationType.WARNING;
    interceptorConfig.api.notification.title = 'apiError.title';
    interceptorConfig.api.notification.text = 'apiError.description';
  }
}

function initializeApp(route: ActivatedRoute, layout: ObMasterLayoutService, translate: TranslateService) {
  return (): Promise<any> => {
    return new Promise((resolve, reject) => {
      route.queryParams.subscribe(params => {
        if (params['force-headless'] || (params['headless'] && inIframe())) {
          layout.layout.hasMainNavigation = false;
          layout.layout.hasLayout = false;
          layout.header.isCustom = true;
          layout.footer.isCustom = true;
        } else {
          layout.layout.hasMainNavigation = true;
          layout.layout.hasLayout = true;
          layout.header.isCustom = false;
          layout.footer.isCustom = false;
        }
        if (params['lang']) {
          translate.use(params['lang']);
        }
        resolve(true);
      });
    });
  };
}

function inIframe() {
  try {
    return window.self !== window.top;
  } catch (e) {
    return true;
  }
}

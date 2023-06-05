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
import { HTTP_INTERCEPTORS, HttpClient, HttpClientModule } from '@angular/common/http';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MatLegacyButtonModule as MatButtonModule } from '@angular/material/legacy-button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatLegacyCardModule as MatCardModule } from '@angular/material/legacy-card';
import { MatLegacyTabsModule as MatTabsModule } from '@angular/material/legacy-tabs';
import { MatLegacyAutocompleteModule as MatAutocompleteModule } from '@angular/material/legacy-autocomplete';
import { MatLegacyFormFieldModule as MatFormFieldModule } from '@angular/material/legacy-form-field';
import { ResultTableComponent } from './shared/components/result-table/result-table.component';
import { MatLegacyTableModule as MatTableModule } from '@angular/material/legacy-table';
import { MatIconModule } from '@angular/material/icon';
import { MatLegacyMenuModule as MatMenuModule } from '@angular/material/legacy-menu';

import {
  MatLegacyDialogActions as MatDialogActions,
  MatLegacyDialogModule as MatDialogModule
} from '@angular/material/legacy-dialog';
import { ResultMapComponent } from './shared/components/result-map/result-map.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatLegacyInputModule as MatInputModule } from '@angular/material/legacy-input';
import { MatLegacyProgressSpinnerModule as MatProgressSpinnerModule } from '@angular/material/legacy-progress-spinner';
import { MatLegacyProgressBarModule as MatProgressBarModule } from '@angular/material/legacy-progress-bar';
import { CoordinateSystemSwitchComponent } from './shared/components/coordinate-system-switch/coordinate-system-switch.component';
import { MatLegacyTooltipModule as MatTooltipModule } from '@angular/material/legacy-tooltip';
import { CoordinatePipe } from './shared/components/coordinate.pipe';
import { DownloadSelectorComponent } from './shared/components/download-selector/download-selector.component';
import { GuideComponent } from './guide/guide.component';
import { MarkdownModule, MarkedOptions } from 'ngx-markdown';
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
    GuideComponent,
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
    MatProgressBarModule,
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
    {
      provide: APP_INITIALIZER,
      useFactory: initializeApp,
      multi: true,
      deps: [ActivatedRoute, ObMasterLayoutService, TranslateService]
    },
    { provide: HTTP_INTERCEPTORS, useClass: ObHttpApiInterceptor, multi: true },
    {
      provide: OB_BANNER,
      useValue: {
        text: 'BFH',
        color: '#FFCB05',
        bgColor: '#37556E'
      }
    },
    MatDialogActions
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

import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import {
  ObENotificationType,
  ObHttpApiInterceptorConfig,
  ObINavigationLink,
  ObMasterLayoutConfig
} from '@oblique/oblique';
import { environment } from '../environments/environment';
import { SharedStandaloneModule } from './shared/shared-standalone.module';

@Component({ selector: 'app-root', imports: [SharedStandaloneModule], templateUrl: './app.component.html' })
export class AppComponent {
  title = '';
  routes: ObINavigationLink[] = [];

  constructor(
    router: Router,
    translate: TranslateService,
    masterConfig: ObMasterLayoutConfig,
    interceptorConfig: ObHttpApiInterceptorConfig
  ) {
    masterConfig.header.isSmall = true;
    masterConfig.homePageRoute = '/address-to-coordinate';
    masterConfig.locale.locales = ['de-CH', 'fr-CH', 'it-CH', 'rm', 'en-CH'];
    masterConfig.footer.isCustom = true;

    interceptorConfig.api.spinner = false;
    interceptorConfig.api.notification.severity = ObENotificationType.WARNING;
    interceptorConfig.api.notification.title = 'apiError.title';
    interceptorConfig.api.notification.text = 'apiError.description';

    this.title = translate.instant('layout.title');

    const nav = router.config
      .filter(r => !!r.path)
      .map(
        r =>
          ({
            url: r.path!,
            label: translate.instant(`layout.nav.${r.path}`),
            children: r.children?.map(c => ({
              url: c.path!,
              label: translate.instant(`layout.nav.${r.path}.${c.path}`)
            }))
          }) as ObINavigationLink
      );

    if (environment.githubLink) {
      nav.push({ url: environment.githubLink, label: 'GitHub', isExternal: true, icon: 'git-hub' });
    }

    this.routes = nav;
  }
}

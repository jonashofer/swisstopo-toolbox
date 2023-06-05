import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ObINavigationLink } from '@oblique/oblique';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent {
  title = '';
  routes: ObINavigationLink[] = [];
  fullWidth = false;

  constructor(router: Router, translateService: TranslateService) {
    this.title = translateService.instant('layout.title');
    const routerConfig = router.config
      .filter(r => r.path)
      .map(r => {
        return {
          url: r.path ?? '',
          label: translateService.instant(`layout.nav.${r.path}`),
          children:
            r.children?.map(c => ({
              url: c.path ?? '',
              label: translateService.instant(`layout.nav.${r.path}.${c.path}`)
            })) ?? undefined
        } as ObINavigationLink;
      });

    if (environment.githubLink) {
      routerConfig.push({
        url: 'https://github.com/jonashofer/swisstopo-toolbox',
        label: 'GitHub',
        isExternal: true,
        icon: 'git-hub'
      });
    }
    this.routes = routerConfig;
  }
}

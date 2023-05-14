import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ObINavigationLink } from '@oblique/oblique';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = '';
  routes: ObINavigationLink[] = [];

  constructor(router: Router, translateService: TranslateService) {
    this.title = translateService.instant('layout.title');
    this.routes = router.config
      .filter(r => r.path)
      .map(r => {
        return {
          url: r.path ?? '',
          label: translateService.instant(`layout.nav.${r.path}`),
          children:
            r.children?.map(c => ({ url: c.path ?? '', label: translateService.instant(`layout.nav.${r.path}.${c.path}`) })) ?? undefined
        };
      });
  }
}

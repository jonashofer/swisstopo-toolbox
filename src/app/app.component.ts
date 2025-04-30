import { Component }                  from '@angular/core';
import { Router }       from '@angular/router';
import { TranslateService }           from '@ngx-translate/core';
import { ObINavigationLink }          from '@oblique/oblique';
import { environment }                from '../environments/environment';
import { SharedStandaloneModule } from './shared/shared-standalone.module';

@Component({
  selector: 'app-root',
  imports: [
    SharedStandaloneModule
],
  templateUrl: './app.component.html'
})
export class AppComponent {
  title = '';
  routes: ObINavigationLink[] = [];

  constructor(router: Router, translate: TranslateService) {
    this.title = translate.instant('layout.title');

    const nav = router.config
      .filter(r => !!r.path)
      .map(r => ({
        url: r.path!,
        label: translate.instant(`layout.nav.${r.path}`),
        children: r.children?.map(c => ({
          url: c.path!,
          label: translate.instant(`layout.nav.${r.path}.${c.path}`)
        }))
      } as ObINavigationLink));

    if (environment.githubLink) {
      nav.push({
        url: environment.githubLink,
        label: 'GitHub',
        isExternal: true,
        icon: 'git-hub'
      });
    }

    this.routes = nav;
  }
}

import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { map, startWith } from 'rxjs/operators';

@Component({
  selector: 'app-guide',
  templateUrl: './guide.component.html',
  styleUrls: ['./guide.component.scss']
})
export class GuideComponent {
  srcLink = this.translateService.onLangChange.pipe(
    map(l => l.lang),
    startWith(this.translateService.currentLang),
    map(l => `../../assets/cookbook/cookbook-${l}.md`)
  );
  constructor(private readonly translateService: TranslateService) {}
}

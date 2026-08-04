import { Component, inject } from '@angular/core';
import { map } from 'rxjs/operators';
import { CoordinateService } from '../../services';
import { CoordinateSystem, CoordinateSystemNames } from '../../models/CoordinateSystem';
import { SharedStandaloneModule } from '../../shared-standalone.module';

@Component({
  selector: 'app-coordinate-system-switch',
  templateUrl: './coordinate-system-switch.component.html',
  styleUrls: ['./coordinate-system-switch.component.scss'],
  imports: [SharedStandaloneModule]
})
export class CoordinateSystemSwitchComponent {
  private readonly service = inject(CoordinateService);

  coordinateSystems = Object.values(CoordinateSystem);
  coordinateSystemNames = CoordinateSystemNames;

  currentSystem$ = this.service.currentSystem$;
  currentSystemName$ = this.currentSystem$.pipe(map(s => CoordinateSystemNames[s]));

  onChange(event: CoordinateSystem) {
    this.service.changeCurrentSystem(event);
  }
}

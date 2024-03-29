import { Component } from '@angular/core';
import { map } from 'rxjs/operators';
import { CoordinateService } from '../../services';
import { CoordinateSystemNames, CoordinateSystem } from '../../models/CoordinateSystem';

@Component({
  selector: 'app-coordinate-system-switch',
  templateUrl: './coordinate-system-switch.component.html',
  styleUrls: ['./coordinate-system-switch.component.scss']
})
export class CoordinateSystemSwitchComponent {
  coordinateSystems = Object.values(CoordinateSystem);
  coordinateSystemNames = CoordinateSystemNames;

  currentSystem$ = this.service.currentSystem$;
  currentSystemName$ = this.currentSystem$.pipe(map(s => CoordinateSystemNames[s]));

  constructor(private readonly service: CoordinateService) {}

  onChange(event: CoordinateSystem) {
    this.service.changeCurrentSystem(event);
  }
}

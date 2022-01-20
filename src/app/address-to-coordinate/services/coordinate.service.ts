import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { CooridnateSystem } from '../components/models/CoordinateSystem';

@Injectable({
  providedIn: 'root'
})
export class CoordinateService {
  private system$: BehaviorSubject<CooridnateSystem> = new BehaviorSubject<CooridnateSystem>(CooridnateSystem.WGS_84);

  public readonly currentSystem$: Observable<CooridnateSystem> = this.system$.asObservable();
  get currentSystem() {
    return this.system$.value;
  }

  constructor() {}

  public changeCurrentSystem(newSystem: CooridnateSystem): void {
    if (this.system$.value !== newSystem) {
      this.system$.next(newSystem);
    }
  }
}

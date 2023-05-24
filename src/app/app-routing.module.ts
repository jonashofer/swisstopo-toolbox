import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GuideComponent } from './guide/guide.component';
import { of, tap } from 'rxjs';
import { AddressToCoordinateComponent, CoordinateToAddressComponent } from './feature-components';
import { LocationStrategy, HashLocationStrategy } from '@angular/common';

const routes: Routes = [
  { path: '', redirectTo: 'address-to-coordinate', pathMatch: 'full' },
  { path: 'address-to-coordinate', component: AddressToCoordinateComponent },
  { path: 'coordinate-to-address', component: CoordinateToAddressComponent },
  { path: 'convert-coordinates', component: CoordinateToAddressComponent },
  {
    path: 'egid',
    children: [
      { path: 'from-address', component: GuideComponent },
      { path: 'to-address', component: GuideComponent }
    ]
  },
  {
    path: 'height',
    children: [
      { path: 'from-coordinates', component: GuideComponent },
      { path: 'from-address', component: GuideComponent }
    ]
  },
  { path: 'guide', component: GuideComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [{ provide: LocationStrategy, useClass: HashLocationStrategy }]
})
export class AppRoutingModule {}

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GuideComponent } from './guide/guide.component';
import { AddressToCoordinateComponent, AddressToEgidComponent, AddressToHeightComponent, CoordinateToAddressComponent, CoordinateToCoordinateComponent, CoordinateToHeightComponent } from './feature-components';

const routes: Routes = [
  { path: '', redirectTo: 'address-to-coordinate', pathMatch: 'full' },
  { path: 'address-to-coordinate', component: AddressToCoordinateComponent },
  { path: 'coordinate-to-address', component: CoordinateToAddressComponent },
  { path: 'convert-coordinates', component: CoordinateToCoordinateComponent },
  {
    path: 'egid',
    children: [
      { path: 'from-address', component: AddressToEgidComponent },
      { path: 'to-address', component: GuideComponent }
    ]
  },
  {
    path: 'height',
    children: [
      { path: 'from-coordinates', component: CoordinateToHeightComponent },
      { path: 'from-address', component: AddressToHeightComponent }
    ]
  },
  { path: 'guide', component: GuideComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: true })],
  exports: [RouterModule]
})
export class AppRoutingModule {}

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AddressToCoordinateComponent } from './address-to-coordinate/address-to-coordinate.component';
import { GuideComponent } from './guide/guide.component';
import { CoordinateToAddressComponent } from './coordinate-to-address/coordinate-to-address.component';

const routes: Routes = [
  { path: '', redirectTo: 'address-to-coordinate', pathMatch: 'full' },
  { path: 'address-to-coordinate', component: AddressToCoordinateComponent },
  { path: 'coordinate-to-address', component: CoordinateToAddressComponent },
  // { path: 'egid', component: AddressToCoordinateComponent },
  { path: 'guide', component: GuideComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}

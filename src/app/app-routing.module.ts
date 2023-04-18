import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AddressToCoordinateComponent } from './address-to-coordinate/address-to-coordinate.component';
import { GuideComponent } from './guide/guide.component';

const routes: Routes = [
  { path: '', redirectTo: 'address-to-coordinate', pathMatch: 'full' },
  { path: 'address-to-coordinate', component: AddressToCoordinateComponent },
  { path: 'coordinate-to-address', component: AddressToCoordinateComponent },
  { path: 'egid', component: AddressToCoordinateComponent },
  { path: 'guide', component: GuideComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}

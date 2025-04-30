// src/app/app-routing.module.ts
import { Routes } from '@angular/router';
import {
  AddressToCoordinateComponent,
  AddressToEgidComponent,
  AddressToHeightComponent,
  CoordinateToAddressComponent,
  CoordinateToCoordinateComponent,
  CoordinateToHeightComponent,
  EgidToAddressComponent,
} from './feature-components';

export const AppRoutes: Routes = [
  { path: '', redirectTo: 'address-to-coordinate', pathMatch: 'full' },
  { path: 'address-to-coordinate', component: AddressToCoordinateComponent },
  { path: 'coordinate-to-address',   component: CoordinateToAddressComponent },
  { path: 'convert-coordinates',     component: CoordinateToCoordinateComponent },
  {
    path: 'egid',
    children: [
      { path: 'from-address', component: AddressToEgidComponent },
      { path: 'to-address',   component: EgidToAddressComponent }
    ]
  },
  {
    path: 'height',
    children: [
      { path: 'from-coordinates', component: CoordinateToHeightComponent },
      { path: 'from-address',     component: AddressToHeightComponent }
    ]
  },
];

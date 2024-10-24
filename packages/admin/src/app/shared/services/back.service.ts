import { Injectable, inject } from '@angular/core';
import { Location } from '@angular/common';
import { Router } from '@angular/router';

interface LocationState {
  navigationId?: number;
}

@Injectable({
  providedIn: 'root',
})
export class BackService {
  private location = inject(Location);
  private router = inject(Router);

  goBack(url?: string) {
    const locationState = this.location.getState() as LocationState;
    if (
      locationState &&
      locationState.navigationId &&
      locationState.navigationId > 1
    ) {
      this.location.back();
    } else {
      this.router.navigateByUrl(url ? url : '/');
    }
  }
}

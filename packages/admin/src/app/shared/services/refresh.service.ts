import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class RefreshService {
  private refreshTrigger: Subject<void> = new Subject<void>();
  refreshTrigger$ = this.refreshTrigger.asObservable();

  triggerRefresh() {
    this.refreshTrigger.next();
  }
}

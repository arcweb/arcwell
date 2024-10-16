import { Component, input, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CREATE_PARTIAL_URL } from '@app/shared/constants/admin.constants';

interface QueryParams {
  type_key?: string;
}

@Component({
  selector: 'aw-no-records',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './no-records.component.html',
  styleUrl: './no-records.component.scss',
})
export class NoRecordsComponent {
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);

  createLinkQueryParams = input<QueryParams>();

  createLink() {
    return this.router.createUrlTree([], {
      relativeTo: this.activatedRoute,
      queryParams: {
        ...this.createLinkQueryParams(),
        detail_id: CREATE_PARTIAL_URL,
      },
    });
  }
}

import { Component, output, input, inject } from '@angular/core';
import { MatButtonModule, MatIconButton } from '@angular/material/button';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faCirclePlus,
  faBars,
  faMagnifyingGlass,
} from '@fortawesome/free-solid-svg-icons';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CREATE_PARTIAL_URL } from '@app/shared/constants/admin.constants';

interface QueryParams {
  type_key?: string;
}

@Component({
  selector: 'aw-table-header',
  standalone: true,
  imports: [
    FontAwesomeModule,
    MatButtonModule,
    RouterLink,
    MatIconButton,
    MatTooltipModule,
  ],
  templateUrl: './table-header.component.html',
  styleUrl: './table-header.component.scss',
})
export class TableHeaderComponent {
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);
  tableName = input.required<string>();
  createLinkQueryParams = input<QueryParams>();

  // hook these up when we have the functionality
  search = output<string>();
  filter = output<string>();

  faCirclePlus = faCirclePlus;
  faBars = faBars;
  faMagnifyingGlass = faMagnifyingGlass;

  onCreate() {
    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: {
        ...this.createLinkQueryParams(),
        detail_id: CREATE_PARTIAL_URL,
      },
    });
  }
}

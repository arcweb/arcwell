import { Component, EventEmitter, output, input } from '@angular/core';
import { MatButtonModule, MatIconButton } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faCirclePlus,
  faBars,
  faMagnifyingGlass,
} from '@fortawesome/free-solid-svg-icons';
import { MatTooltipModule } from '@angular/material/tooltip';

interface QueryParams {
  typeKey?: string;
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
  tableName = input.required<string>();
  createLink = input.required<string>();
  createLinkQueryParams = input<QueryParams>();

  // hook these up when we have the functionality
  search = output<string>();
  filter = output<string>();

  faCirclePlus = faCirclePlus;
  faBars = faBars;
  faMagnifyingGlass = faMagnifyingGlass;
}

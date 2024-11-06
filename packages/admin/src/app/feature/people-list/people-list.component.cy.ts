import { AsyncPipe, JsonPipe } from '@angular/common';
import { PeopleListComponent } from './people-list.component';
import { ErrorContainerComponent } from '../error-container/error-container.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatIconButton } from '@angular/material/button';
import { PeopleTableComponent } from '@app/shared/components/people-table/people-table.component';
import { TableHeaderComponent } from '@app/shared/components/table-header/table-header.component';
import { NoRecordsComponent } from '@app/shared/components/no-records/no-records.component';
import { HttpClient, HttpHandler } from '@angular/common/http';

describe('PeopleListComponent', () => {
  it('can mount with correct imports and providers', () => {
    cy.mount(PeopleListComponent, {
      imports: [
        AsyncPipe,
        JsonPipe,
        ErrorContainerComponent,
        FontAwesomeModule,
        RouterLink,
        MatIconButton,
        PeopleTableComponent,
        TableHeaderComponent,
        NoRecordsComponent,
      ],
      providers: [HttpClient, HttpHandler],
      autoSpyOutputs: true,
    });
  });
});

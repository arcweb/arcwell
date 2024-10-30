import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderCellDef,
  MatHeaderRow,
  MatHeaderRowDef,
  MatRow,
  MatRowDef,
  MatTable,
  MatTableDataSource,
} from '@angular/material/table';
import { PeopleTableComponent } from './people-table.component';
import { PersonModel } from '@app/shared/models/person.model';
import { initialState } from '@app/feature/people-list/people-list.store';
import { MatPaginator } from '@angular/material/paginator';
import { MatIcon } from '@angular/material/icon';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatSortModule } from '@angular/material/sort';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { createOutputSpy } from 'cypress/angular-signals';
import { peopleFactory } from '@shared/factories/people';

describe('PeopleTableComponent', () => {
  it('can mount with correct inputs', () => {
    const peopleList = peopleFactory(13);
    const personResponse: { data: PersonModel[]; meta: { count: number } } = {
      data: peopleList,
      meta: {
        count: peopleList.length,
      },
    };

    const displayedColumns = [
      'familyName',
      'givenName',
      'personType',
      'tags',
      'delete',
    ];

    cy.mount(PeopleTableComponent, {
      imports: [
        MatTable,
        MatColumnDef,
        MatRowDef,
        MatHeaderRowDef,
        MatCellDef,
        MatHeaderCellDef,
        MatRow,
        MatCell,
        MatHeaderCell,
        MatHeaderRow,
        MatPaginator,
        MatIcon,
        MatIconButton,
        MatSortModule,
        MatButton,
        NoopAnimationsModule,
      ],
      componentProperties: {
        dataSource: new MatTableDataSource<PersonModel>(personResponse.data),
        displayedColumns: displayedColumns,
        matSortActive: initialState.sort,
        matSortDirection: initialState.order,
        length: peopleList.length,
        pageSizes: [10, 25, 50],
        pageSize: initialState.limit,
        pageIndex: initialState.pageIndex,
        onDeleteClicked: createOutputSpy('onDeleteClickedSpy'),
        onPageChanged: createOutputSpy('onPageChangedClickSpy'),
        onRowClicked: createOutputSpy('onRowClickedSpy'),
        onSortChanged: createOutputSpy('onSortClickedSpy'),
        onViewAccountClicked: createOutputSpy('onViewAccountClickedSpy'),
      },
    });

    cy.get('[data-cy=people-table]').should('exist');
    cy.get('[data-cy=people-header-row]').should('exist');
    cy.get('[data-cy=people-header-row]').within(() => {
      cy.contains('Family Name');
      cy.contains('Given Name');
      cy.contains('Person Type');
      cy.contains('Tags');
    });

    cy.get('[data-cy=person-data-row]').should('have.length', 10);
  });
});

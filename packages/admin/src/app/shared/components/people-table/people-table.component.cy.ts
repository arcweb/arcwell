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
import { peopleFactory } from '@app/shared/testing/factories/people';
import { PeopleResponseType } from '@app/shared/schemas/person.schema';

describe('PeopleTableComponent', () => {
  it('can mount with correct inputs', () => {
    const peopleList = peopleFactory(10);
    const personResponse: PeopleResponseType = {
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
      autoSpyOutputs: true,
      componentProperties: {
        dataSource: new MatTableDataSource<PersonModel>(personResponse.data),
        displayedColumns: displayedColumns,
        matSortActive: initialState.sort,
        matSortDirection: initialState.order,
        length: peopleList.length,
        pageSizes: [10, 25, 50],
        pageSize: 10,
        pageIndex: initialState.pageIndex,
        onDeleteClicked: createOutputSpy('onDeleteClickedSpy'),
        onPageChanged: createOutputSpy('onPageChangedClickSpy'),
        onRowClicked: createOutputSpy('onRowClickedSpy'),
        onSortChanged: createOutputSpy('onSortChangedSpy'),
        onViewAccountClicked: createOutputSpy('onViewAccountClickedSpy'),
      },
    });
    // check the table is rendered
    cy.get('[data-cy=people-table]').should('exist');
    // check the header row and its contents
    cy.get('[data-cy=people-header-row]').should('exist');
    cy.get('[data-cy=people-header-row]').within(() => {
      cy.contains('Family Name');
      cy.contains('Given Name');
      cy.contains('Person Type');
      cy.contains('Tags');
    });
    // check the data rows and their contents
    cy.get('[data-cy=person-data-row]').should('have.length', 10);
    cy.get('[data-cy=person-data-row]')
      .first()
      .within(() => {
        cy.contains('Doe-0');
        cy.contains('John-0');
        cy.contains('Student');
      });
    // check the paginator and its contents
    cy.get('[data-cy=people-table-paginator]').should('exist');
    cy.get('.mat-mdc-paginator-range-label').contains('1 – 10 of 10');
    // check the sort header
    cy.get(
      '[data-cy="given-name-header-cell"] > .mat-sort-header-container > .mat-sort-header-content',
    ).click();
    cy.get('@onSortChangedSpy').should('have.been.calledWith', {
      active: 'givenName',
      direction: 'asc',
    });
    // check the delete button
    cy.get('[data-cy=delete-button-1]').should('exist').click();
    cy.get('@onDeleteClickedSpy').should('have.been.calledWith', '21');
    // check the row click
    cy.get('[data-cy="familyName-0"]').click();
    cy.get('@onRowClickedSpy').should('have.been.calledWith', peopleList[0]);
  });
});

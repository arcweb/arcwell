import { ReactiveFormsModule } from '@angular/forms';
import { ChangePasswordComponent } from './change-password-form.component';
import {
  MatError,
  MatFormField,
  MatInput,
  MatLabel,
} from '@angular/material/input';
import { MatButton } from '@angular/material/button';
import { ErrorContainerComponent } from '@app/feature/error-container/error-container.component';
import { MatIcon } from '@angular/material/icon';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClient, HttpHandler } from '@angular/common/http';

describe('ChangePasswordFormComponent', () => {
  it('can mount with correct imports and providers', () => {
    const newPassword = 'evenMoreSuperSecure';
    cy.mount(ChangePasswordComponent, {
      imports: [
        ReactiveFormsModule,
        MatInput,
        MatLabel,
        MatFormField,
        MatButton,
        MatError,
        ErrorContainerComponent,
        MatIcon,
        NoopAnimationsModule,
      ],
      providers: [HttpClient, HttpHandler],
      autoSpyOutputs: true,
    });
    cy.contains('Enter New Password', { matchCase: false });
    cy.contains('Please Enter your current password and new password', {
      matchCase: false,
    });
    cy.get('[data-cy=change-password-button]').should('be.disabled');
    cy.get('[data-cy=current-password-input]').type('superSecure', {
      force: true,
    });
    cy.get('[data-cy=new-password-input]').type(newPassword, { force: true });
    cy.get('[data-cy=confirm-password-input]').type('betterSecure', {
      force: true,
    });
    cy.get('[data-cy=password-match-error]').should('exist');
    cy.get('[data-cy=confirm-password-input]')
      .clear()
      .type(newPassword, { force: true });
    cy.get('[data-cy=password-match-error]').should('not.exist');
  });
});

// TODO: Figure out how to test this without an icon error

// import { ReactiveFormsModule } from '@angular/forms';
// import { ForgotPasswordComponent } from './forgot-password-form.component';
// import {
//   MatError,
//   MatFormField,
//   MatInput,
//   MatLabel,
// } from '@angular/material/input';
// import { MatButton } from '@angular/material/button';
// import { ErrorContainerComponent } from '@app/feature/error-container/error-container.component';
// import { MatIcon } from '@angular/material/icon';
// import { NoopAnimationsModule } from '@angular/platform-browser/animations';
// import { HttpClient, HttpHandler } from '@angular/common/http';

// describe('ForgotPasswordComponent', () => {
//   it('can mount with correct imports', () => {
//     cy.mount(ForgotPasswordComponent, {
//       imports: [
//         ReactiveFormsModule,
//         MatInput,
//         MatLabel,
//         MatFormField,
//         MatButton,
//         MatError,
//         ErrorContainerComponent,
//         MatIcon,
//         NoopAnimationsModule,
//       ],
//       providers: [HttpClient, HttpHandler],
//     });
//     cy.contains('Forgot Password', { matchCase: false });
//     cy.contains(
//       'Enter your email address and we will send you a link to reset your password.',
//     );
//     cy.get('[data-cy=email').type('test-test');
//     cy.get('[data-cy=submit-button]');
//     cy.get('[data-cy=submit-button]').should('be.disabled');
//   });
// });

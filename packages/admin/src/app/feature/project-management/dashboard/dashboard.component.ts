import { Component } from '@angular/core';
import { MatCard, MatCardContent, MatCardFooter } from '@angular/material/card';
import { MatLabel } from '@angular/material/form-field';

@Component({
  selector: 'aw-dashboard',
  standalone: true,
  imports: [MatCard, MatLabel, MatCardContent, MatCardFooter],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {}

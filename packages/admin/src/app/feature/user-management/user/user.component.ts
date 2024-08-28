import { Component, effect, inject, Input, OnInit } from '@angular/core';
import { UserStore } from '../all-users/users.store';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'aw-user',
  standalone: true,
  imports: [],
  providers: [UserStore],
  templateUrl: './user.component.html',
  styleUrl: './user.component.scss',
})
export class UserComponent implements OnInit {
  readonly userStore = inject(UserStore);

  @Input() userId!: string;

  userForm = new FormGroup({});

  constructor() {}
}

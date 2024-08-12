import { Component, inject } from '@angular/core';

import { MatToolbarModule } from '@angular/material/toolbar';
import { ClickDirective } from '@app/shared/directives/click.directive';
import { UserModel } from '@app/shared/models';

import { BrandService } from '@app/shared/services/brand.service';
import { UserService } from '@app/shared/services/user.service';

@Component({
  selector: 'aw-topbar',
  standalone: true,
  imports: [MatToolbarModule, ClickDirective],
  templateUrl: './top-menu.component.html',
  styleUrl: './top-menu.component.scss',
})
export class TopBarComponent {
  private brandService: BrandService = inject(BrandService);
  arcwellLogo = 'some_svg';
  instanceName = this.brandService.getInstanceName(4);

  //   private userService: UserService = inject(UserService);
  //   user: UserModel = this.userService.getUser('1');

  userImg = 'uer_svg';

  manageProject() {
    throw new Error('Method not implemented.');
  }
  serverSettings() {
    throw new Error('Method not implemented.');
  }
  goToUser() {
    throw new Error('Method not implemented.');
  }
}

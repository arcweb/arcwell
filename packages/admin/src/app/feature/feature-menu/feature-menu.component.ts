import { Component, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ClickDirective } from '@app/shared/directives/click.directive';
import { MenuService } from '@app/shared/services/menu.service';

@Component({
  selector: 'aw-features',
  standalone: true,
  imports: [ClickDirective, MatIconModule],
  templateUrl: './feature-menu.component.html',
  styleUrl: './feature-menu.component.scss',
})
export class FeatureMenuComponent {
  private menuService: MenuService = inject(MenuService);

  menuItems = this.menuService.getFeatureItems();

  menuClick() {
    throw new Error('Method not implemented.');
  }
}

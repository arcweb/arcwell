import {
  Component,
  ComponentRef,
  OnDestroy,
  Type,
  ViewContainerRef,
  effect,
  inject,
  input,
} from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { CohortComponent } from '@feature/cohort/cohort.component';
import { EventComponent } from '@feature/event/event.component';
import { EventTypeComponent } from '@feature/event-type/event-type.component';
import { FactComponent } from '@feature/fact/fact.component';
import { FactTypeComponent } from '@feature/fact-type/fact-type.component';
import { PersonComponent } from '@feature/person/person.component';
import { PersonTypeComponent } from '@feature/person-type/person-type.component';
import { ResourceComponent } from '@feature/resource/resource.component';
import { ResourceTypeComponent } from '@feature/resource-type/resource-type.component';
import { TagComponent } from '@feature/tag/tag.component';
import { UserComponent } from '@feature/users/user/user.component';
// create compound type of all detail components
export type DetailComponentType =
  | CohortComponent
  | EventComponent
  | EventTypeComponent
  | FactComponent
  | FactTypeComponent
  | PersonComponent
  | PersonTypeComponent
  | ResourceComponent
  | ResourceTypeComponent
  | TagComponent
  | UserComponent;

@Component({
  selector: 'aw-detail',
  standalone: true,
  imports: [FontAwesomeModule],
  templateUrl: './detail.component.html',
  styleUrl: './detail.component.scss',
})
export class DetailComponent implements OnDestroy {
  private viewContainer = inject(ViewContainerRef);
  faTimes = faTimes;
  detailId = input.required<string>();
  detailComponent = input.required<Type<DetailComponentType> | null>();
  typeKey = input<string>();
  private componentRef!: ComponentRef<DetailComponentType>;

  constructor() {
    // dynamically create the detail component and set inputs
    effect(() => {
      if (this.detailComponent() !== null) {
        const component = this.detailComponent();
        if (component) {
          this.viewContainer.clear();
          this.componentRef = this.viewContainer.createComponent(component);

          if (this.detailId() !== undefined) {
            this.componentRef.instance.detailId = this.detailId();
          }
          if (
            this.typeKey() !== undefined &&
            'typeKey' in this.componentRef.instance
          ) {
            this.componentRef.instance.typeKey = this.typeKey();
          }
        }
      }
    });
  }

  ngOnDestroy() {
    if (this.componentRef) {
      this.componentRef.destroy();
    }
  }
}

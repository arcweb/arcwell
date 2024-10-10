// import {
//   AfterViewInit,
//   Component,
//   ComponentRef,
//   OnDestroy,
//   Type,
//   ViewContainerRef,
//   inject,
//   input,
// } from '@angular/core';
// import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
// import { faTimes } from '@fortawesome/free-solid-svg-icons';
// import { PersonComponent } from '../person/person.component';
// import { CohortComponent } from '../cohort/cohort.component';
// import { EventComponent } from '../event/event.component';
// import { EventTypeComponent } from '../event-type/event-type.component';
// import { FactComponent } from '../fact/fact.component';
// import { FactTypeComponent } from '../fact-type/fact-type.component';
// import { PersonTypeComponent } from '../person-type/person-type.component';
// import { ResourceComponent } from '../resource/resource.component';
// import { ResourceTypeComponent } from '../resource-type/resource-type.component';
// import { TagComponent } from '../tag/tag.component';
// import { UserComponent } from '@app/feature/user-management/user/user.component';

// @Component({
//   selector: 'aw-detail',
//   standalone: true,
//   imports: [FontAwesomeModule],
//   templateUrl: './detail.component.html',
//   styleUrl: './detail.component.scss',
// })
// export class DetailComponent implements AfterViewInit, OnDestroy {
//   private viewContainer = inject(ViewContainerRef);
//   faTimes = faTimes;
//   detailId = input.required<string>();
//   detailComponent = input.required<Type<DetailComponentType>>();
//   private componentRef!: ComponentRef<DetailComponentType>;

//   ngAfterViewInit() {
//     const component = this.detailComponent();
//     if (component) {
//       this.viewContainer.clear();
//       this.componentRef = this.viewContainer.createComponent(component);
//       if (this.detailId() !== undefined) {
//         this.componentRef.instance.detailId = this.detailId();
//       }
//     }
//   }

//   ngOnDestroy() {
//     if (this.componentRef) {
//       this.componentRef.destroy();
//     }
//   }
// }

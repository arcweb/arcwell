import {
  AfterViewInit,
  Component,
  ComponentRef,
  Type,
  ViewContainerRef,
  inject,
  signal,
  OnDestroy,
  ViewChild,
  EventEmitter,
  effect,
} from '@angular/core';
import { AuthStore } from '@shared/store/auth.store';
import {
  ActivatedRoute,
  NavigationEnd,
  Router,
  RouterLink,
  RouterOutlet,
} from '@angular/router';
import { FeaturesMenuComponent } from '@feature/project-management/features-menu/features-menu.component';
import { FeatureStore } from '@app/shared/store/feature.store';
import { MatSidenavModule } from '@angular/material/sidenav';
import { ConfigBarComponent } from '../../shared/components/config-bar/config-bar.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { filter } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CohortComponent } from './cohort/cohort.component';
import { UserComponent } from '../user-management/user/user.component';
import { EventTypeComponent } from './event-type/event-type.component';
import { EventComponent } from './event/event.component';
import { FactComponent } from './fact/fact.component';
import { FactTypeComponent } from './fact-type/fact-type.component';
import { PersonComponent } from './person/person.component';
import { PersonTypeComponent } from './person-type/person-type.component';
import { ResourceComponent } from './resource/resource.component';
import { ResourceTypeComponent } from './resource-type/resource-type.component';
import { TagComponent } from './tag/tag.component';

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
  selector: 'aw-home',
  standalone: true,
  imports: [
    RouterLink,
    FeaturesMenuComponent,
    RouterOutlet,
    MatSidenavModule,
    ConfigBarComponent,
    FontAwesomeModule,
  ],
  templateUrl: './project-management.component.html',
  styleUrl: './project-management.component.scss',
})
export class ProjectManagementComponent implements AfterViewInit, OnDestroy {
  readonly authStore = inject(AuthStore);
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);
  readonly featureStore = inject(FeatureStore);
  readonly navigation = this.router.events.pipe(
    takeUntilDestroyed(),
    filter(event => event instanceof NavigationEnd),
  );
  @ViewChild('detailComponent', { read: ViewContainerRef })
  private viewContainer = inject(ViewContainerRef);
  public detailComponent = signal<Type<DetailComponentType> | null>(null);
  detailId = signal<string | null>(null);
  private componentRef!: ComponentRef<DetailComponentType>;

  public detailOpen = signal<boolean>(false);
  public faTimes = faTimes;

  constructor() {
    this.navigation.subscribe(event => {
      if (event instanceof NavigationEnd) {
        console.log('navigation');
        // get the detail_id queryparam from the url
        const { detail_id } = this.activatedRoute.snapshot.queryParams;
        // if the detail_id queryparam is not present, clear the detailComponent and detailId signals
        console.log('detail_id', detail_id);
        if (!detail_id) {
          this.detailId.set(null);
          this.detailComponent.set(null);
          this.viewContainer.clear();
          this.detailOpen.set(false);
        } else {
          this.detailOpen.set(true);
          this.detailId.set(detail_id);
          // get the detailComponent from the route data
          // TODO: look into refactoring routing so that the detailComponent is not nested so deeply
          // when getting it from the user-managment route
          const detailComponent =
            this.activatedRoute.snapshot.firstChild?.data['detailComponent'] ||
            this.activatedRoute.snapshot.firstChild?.firstChild?.firstChild
              ?.data['detailComponent'];

          if (detailComponent) {
            console.log('detailComponent', detailComponent);
            console.log('this.viewContainer', this.viewContainer);
            this.detailComponent.set(detailComponent);
            this.componentRef =
              this.viewContainer.createComponent(detailComponent);
            this.componentRef.instance.detailId = this.detailId()!;
            this.componentRef.instance.closeDrawer = new EventEmitter<void>();
            this.componentRef.instance.closeDrawer.subscribe(() =>
              this.closeDetail(),
            );
          }
        }
      }
    });

    // effect(() => {
    //   if (this.detailOpen()) {
    //     const detailComponent = this.detailComponent();
    //     console.log('detailComponent', detailComponent);
    //     if (detailComponent) {
    //       console.log(this.viewContainer);
    //       this.viewContainer.clear();
    //       this.componentRef =
    //         this.viewContainer.createComponent(detailComponent);
    //       if (this.detailId() !== undefined && this.detailId() !== null) {
    //         this.componentRef.instance.detailId = this.detailId()!;
    //         this.componentRef.instance.closeDrawer = new EventEmitter<void>();
    //         this.componentRef.instance.closeDrawer.subscribe(() =>
    //           this.closeDetail(),
    //         );
    //       }
    //     }
    //   }
    // });
  }

  ngAfterViewInit() {
    if (this.authStore.currentUser()) {
      this.featureStore.load();
    }
  }

  closeDetail() {
    // remove the detail_id queryparam causing the detail sidenav to close
    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: {},
    });
  }

  ngOnDestroy() {
    if (this.componentRef) {
      this.componentRef.destroy();
    }
  }
}

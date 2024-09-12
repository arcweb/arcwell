import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResourceTypesComponent } from './resource-types.component';

describe('ResourceTypesComponent', () => {
  let component: ResourceTypesComponent;
  let fixture: ComponentFixture<ResourceTypesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResourceTypesComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ResourceTypesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

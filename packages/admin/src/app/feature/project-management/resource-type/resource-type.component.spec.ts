import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ResourceTypeComponent } from './resource-type.component';

describe('ResourceTypeComponent', () => {
  let component: ResourceTypeComponent;
  let fixture: ComponentFixture<ResourceTypeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResourceTypeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ResourceTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllResourceTypesComponent } from './all-resource-types.component';

describe('AllResourceTypesComponent', () => {
  let component: AllResourceTypesComponent;
  let fixture: ComponentFixture<AllResourceTypesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AllResourceTypesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AllResourceTypesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

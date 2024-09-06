import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllEventTypesComponent } from './all-event-types.component';

describe('AllEventTypesComponent', () => {
  let component: AllEventTypesComponent;
  let fixture: ComponentFixture<AllEventTypesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AllEventTypesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AllEventTypesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

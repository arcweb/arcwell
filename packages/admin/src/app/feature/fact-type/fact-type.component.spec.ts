import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FactTypeComponent } from './fact-type.component';

describe('FactComponent', () => {
  let component: FactTypeComponent;
  let fixture: ComponentFixture<FactTypeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FactTypeComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FactTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

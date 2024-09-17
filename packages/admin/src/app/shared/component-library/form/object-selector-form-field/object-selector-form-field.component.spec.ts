import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ObjectSelectorFormFieldComponent } from './object-selector-form-field.component';

describe('ObjectSelectorFormFieldComponent', () => {
  let component: ObjectSelectorFormFieldComponent;
  let fixture: ComponentFixture<ObjectSelectorFormFieldComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ObjectSelectorFormFieldComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ObjectSelectorFormFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

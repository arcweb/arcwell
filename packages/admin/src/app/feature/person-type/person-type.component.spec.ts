import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PersonTypeComponent } from './person-type.component';

describe('PersonComponent', () => {
  let component: PersonTypeComponent;
  let fixture: ComponentFixture<PersonTypeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PersonTypeComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PersonTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

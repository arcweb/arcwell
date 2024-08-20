import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PeopleTypesComponent } from './people-types.component';

describe('PeopleTypesComponent', () => {
  let component: PeopleTypesComponent;
  let fixture: ComponentFixture<PeopleTypesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PeopleTypesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PeopleTypesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

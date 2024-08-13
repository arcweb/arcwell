import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubnavComponent } from './feature-sub-menu.component';

describe('SubnavComponent', () => {
  let component: SubnavComponent;
  let fixture: ComponentFixture<SubnavComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubnavComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(SubnavComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

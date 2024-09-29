import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Phq9Page } from './phq9.page';

describe('Phq9Page', () => {
  let component: Phq9Page;
  let fixture: ComponentFixture<Phq9Page>;

  beforeEach(() => {
    fixture = TestBed.createComponent(Phq9Page);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

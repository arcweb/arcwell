import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SurveysPage } from './surveys.page';

describe('SurveysPage', () => {
  let component: SurveysPage;
  let fixture: ComponentFixture<SurveysPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(SurveysPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

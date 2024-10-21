import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetailHeaderComponent } from './detail-header.component';

describe('DetailHeaderComponent', () => {
  let component: DetailHeaderComponent;
  let fixture: ComponentFixture<DetailHeaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetailHeaderComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DetailHeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

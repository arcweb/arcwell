import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TagsFormComponent } from './tags-form.component';

describe('TagsFormComponent', () => {
  let component: TagsFormComponent;
  let fixture: ComponentFixture<TagsFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TagsFormComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TagsFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

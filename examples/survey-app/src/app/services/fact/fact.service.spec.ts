import { TestBed } from '@angular/core/testing';

import { FactService } from './fact.service';

describe('FactService', () => {
  let service: FactService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FactService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

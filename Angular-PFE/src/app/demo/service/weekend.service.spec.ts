import { TestBed } from '@angular/core/testing';

import { WeekendService } from './weekend.service';

describe('WeekendService', () => {
  let service: WeekendService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WeekendService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

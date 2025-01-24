import { TestBed } from '@angular/core/testing';

import { OrdreDeMissionService } from './ordre-de-mission.service';

describe('OrdreDeMissionService', () => {
  let service: OrdreDeMissionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OrdreDeMissionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

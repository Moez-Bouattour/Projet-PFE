import { TestBed } from '@angular/core/testing';

import { ApprobateurService } from './approbateur.service';

describe('ApprobateurService', () => {
  let service: ApprobateurService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ApprobateurService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

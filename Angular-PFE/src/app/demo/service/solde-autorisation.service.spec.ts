import { TestBed } from '@angular/core/testing';

import { SoldeAutorisationService } from './solde-autorisation.service';

describe('SoldeAutorisationService', () => {
  let service: SoldeAutorisationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SoldeAutorisationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

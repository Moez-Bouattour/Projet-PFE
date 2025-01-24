import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ParametrageSoldeComponent } from './parametrage-solde.component';

describe('ParametrageSoldeComponent', () => {
  let component: ParametrageSoldeComponent;
  let fixture: ComponentFixture<ParametrageSoldeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ParametrageSoldeComponent]
    });
    fixture = TestBed.createComponent(ParametrageSoldeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

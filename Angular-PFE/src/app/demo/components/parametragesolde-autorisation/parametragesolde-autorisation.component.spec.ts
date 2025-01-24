import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ParametragesoldeAutorisationComponent } from './parametragesolde-autorisation.component';

describe('ParametragesoldeAutorisationComponent', () => {
  let component: ParametragesoldeAutorisationComponent;
  let fixture: ComponentFixture<ParametragesoldeAutorisationComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ParametragesoldeAutorisationComponent]
    });
    fixture = TestBed.createComponent(ParametragesoldeAutorisationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

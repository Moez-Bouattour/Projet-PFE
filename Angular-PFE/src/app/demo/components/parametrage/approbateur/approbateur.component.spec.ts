import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApprobateurComponent } from './approbateur.component';

describe('ApprobateurComponent', () => {
  let component: ApprobateurComponent;
  let fixture: ComponentFixture<ApprobateurComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ApprobateurComponent]
    });
    fixture = TestBed.createComponent(ApprobateurComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

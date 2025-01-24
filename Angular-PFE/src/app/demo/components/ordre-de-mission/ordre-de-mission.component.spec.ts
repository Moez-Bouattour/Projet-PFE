import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrdreDeMissionComponent } from './ordre-de-mission.component';

describe('OrdreDeMissionComponent', () => {
  let component: OrdreDeMissionComponent;
  let fixture: ComponentFixture<OrdreDeMissionComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [OrdreDeMissionComponent]
    });
    fixture = TestBed.createComponent(OrdreDeMissionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

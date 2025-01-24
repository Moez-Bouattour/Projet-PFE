import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InfoChefComponent } from './info-chef.component';

describe('InfoChefComponent', () => {
  let component: InfoChefComponent;
  let fixture: ComponentFixture<InfoChefComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [InfoChefComponent]
    });
    fixture = TestBed.createComponent(InfoChefComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

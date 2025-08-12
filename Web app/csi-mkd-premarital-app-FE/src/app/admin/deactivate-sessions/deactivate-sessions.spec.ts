import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeactivateSessions } from './deactivate-sessions';

describe('DeactivateSessions', () => {
  let component: DeactivateSessions;
  let fixture: ComponentFixture<DeactivateSessions>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeactivateSessions]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DeactivateSessions);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

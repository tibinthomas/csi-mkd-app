import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PreConfirmRegister } from './pre-confirm-register';

describe('PreConfirmRegister', () => {
  let component: PreConfirmRegister;
  let fixture: ComponentFixture<PreConfirmRegister>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PreConfirmRegister]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PreConfirmRegister);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

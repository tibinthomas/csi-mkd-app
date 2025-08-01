import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GeneralRegister } from './general-register';

describe('GeneralRegister', () => {
  let component: GeneralRegister;
  let fixture: ComponentFixture<GeneralRegister>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GeneralRegister],
    }).compileComponents();

    fixture = TestBed.createComponent(GeneralRegister);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

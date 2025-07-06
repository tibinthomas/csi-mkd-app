import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PremaritalRegister } from './premarital-register';

describe('PremaritalRegister', () => {
  let component: PremaritalRegister;
  let fixture: ComponentFixture<PremaritalRegister>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PremaritalRegister]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PremaritalRegister);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

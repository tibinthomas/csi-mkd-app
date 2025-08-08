import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PreConfirmList } from './pre-confirm-list';

describe('PreConfirmList', () => {
  let component: PreConfirmList;
  let fixture: ComponentFixture<PreConfirmList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PreConfirmList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PreConfirmList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GeneralList } from './general-list';

describe('GeneralList', () => {
  let component: GeneralList;
  let fixture: ComponentFixture<GeneralList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GeneralList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GeneralList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

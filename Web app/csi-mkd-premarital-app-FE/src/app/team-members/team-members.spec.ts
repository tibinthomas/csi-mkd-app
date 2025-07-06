import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TeamMembers } from './team-members';

describe('TeamMembers', () => {
  let component: TeamMembers;
  let fixture: ComponentFixture<TeamMembers>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TeamMembers]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TeamMembers);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

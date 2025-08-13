import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeedbackQuestions } from './feedback-questions';

describe('FeedbackQuestions', () => {
  let component: FeedbackQuestions;
  let fixture: ComponentFixture<FeedbackQuestions>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeedbackQuestions],
    }).compileComponents();

    fixture = TestBed.createComponent(FeedbackQuestions);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { QuestionAnswersList } from './question-answers-list';

describe('QuestionAnswersList', () => {
  let component: QuestionAnswersList;
  let fixture: ComponentFixture<QuestionAnswersList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuestionAnswersList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuestionAnswersList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
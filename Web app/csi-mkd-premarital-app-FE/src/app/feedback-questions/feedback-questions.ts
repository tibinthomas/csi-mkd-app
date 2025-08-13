import { ChangeDetectionStrategy, Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-feedback-questions',
  imports: [],
  templateUrl: './feedback-questions.html',
  styleUrl: './feedback-questions.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FeedbackQuestions {
  constructor(private router: Router) {}

  goToForm(type: 'feedback' | 'questions') {
    this.router.navigate([`/${type}`]);
  }
}

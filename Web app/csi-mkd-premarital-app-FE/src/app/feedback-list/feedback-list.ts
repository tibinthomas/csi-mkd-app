import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FeedbackService } from '../../api/services';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, map, of } from 'rxjs';
import { MatTableModule } from '@angular/material/table';

@Component({
  selector: 'app-feedback-list',
  imports: [CommonModule, MatTableModule],
  templateUrl: './feedback-list.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FeedbackList {
  private readonly feedbackService = inject(FeedbackService);
  displayedColumns: string[] = [
    'sessionTitle',
    'name',
    'email',
    'date',
    'qualityRating',
    'relevanceRating',
    'engagementRating',
    'organizationRating',
    'valuable',
    'improvements',
    'comments',
  ];

  private readonly feedbacks$ = this.feedbackService.apiFeedbackGet().pipe(
    map((data: any) => {
      return data;
    }),
    catchError((err) => {
      console.error('Error loading feedbacks:', err);
      return of([]); // fallback to empty array
    })
  );

  protected readonly feedbacks = toSignal(this.feedbacks$, {
    initialValue: [],
  });
}

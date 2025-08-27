import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
  computed,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, map, of } from 'rxjs';
import { CommonModule, DatePipe } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CsiMkdPremaritalAppBeService } from '../../../api/api-main-app/services';
import {
  ClassFeedbackResponseDto,
  ClassFeedbackDetailDto,
} from '../../../api/api-main-app/models';

@Component({
  selector: 'app-feedback-list',
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatExpansionModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
  ],
  templateUrl: './feedback-list.html',
  styleUrl: './feedback-list.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FeedbackList {
  private readonly apiService = inject(CsiMkdPremaritalAppBeService);
  private readonly snackBar = inject(MatSnackBar);

  readonly searchTerm = signal('');
  readonly isLoading = signal(false);

  private readonly feedbackData$ = this.apiService.apiCosmosFeedbackGet().pipe(
    map((response) => ({ data: response, error: null })),
    catchError((error) => {
      console.error('Error fetching feedback:', error);
      this.snackBar.open('Failed to load feedback data', 'Close', {
        duration: 3000,
      });
      return of({ data: [], error: error.message });
    })
  );

  readonly feedbackResponse = toSignal(this.feedbackData$, {
    initialValue: { data: [], error: null },
  });

  readonly filteredFeedback = computed(() => {
    const feedback = this.feedbackResponse().data;
    const searchTerm = this.searchTerm().toLowerCase();

    if (!searchTerm) {
      return feedback;
    }

    return feedback.filter(
      (item) =>
        item.name?.toLowerCase().includes(searchTerm) ||
        item.email?.toLowerCase().includes(searchTerm) ||
        item.premaritalRegistrationId?.toLowerCase().includes(searchTerm)
    );
  });

  readonly displayedColumns = ['name', 'email', 'createdAt', 'actions'];

  formatDate(dateString: string | undefined): string {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  getFeedbackSummary(feedback: ClassFeedbackResponseDto): string {
    const feedbackCount = feedback.feedbacks
      ? Object.keys(feedback.feedbacks).length
      : 0;
    return `${feedbackCount} feedback${
      feedbackCount !== 1 ? 's' : ''
    } provided`;
  }

  getFeedbackEntries(
    feedback: ClassFeedbackResponseDto
  ): Array<{ key: string; value: ClassFeedbackDetailDto }> {
    if (!feedback.feedbacks) return [];
    return Object.entries(feedback.feedbacks).map(([key, value]) => ({
      key,
      value: value as ClassFeedbackDetailDto,
    }));
  }

  getRatingEntries(ratings: any): Array<{ key: string; value: any }> {
    if (!ratings) return [];
    return Object.entries(ratings).map(([key, value]) => ({ key, value }));
  }

  getTextResponseEntries(
    textResponses: any
  ): Array<{ key: string; value: any }> {
    if (!textResponses) return [];
    return Object.entries(textResponses).map(([key, value]) => ({
      key,
      value,
    }));
  }

  refreshData(): void {
    this.isLoading.set(true);
    // The data will refresh automatically due to the observable
    setTimeout(() => this.isLoading.set(false), 1000);
  }
}

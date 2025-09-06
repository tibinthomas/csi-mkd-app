import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  MatDialogModule,
  MAT_DIALOG_DATA,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatExpansionModule } from '@angular/material/expansion';

export interface QuestionsModalData {
  user: any;
  questionAnswers: any;
}

@Component({
  selector: 'app-questions-modal',
  template: `
    <div
      mat-dialog-content
      class="w-full p-2"
      style="height: calc(95vh - 60px); overflow: hidden;"
    >
      <mat-card class="w-full mx-auto p-4 h-full overflow-hidden">
        <mat-card-header class="mb-3 pb-2 flex justify-between items-center">
          <mat-card-title class="!font-bold text-lg" i18n>
            Question Answers - {{ data.user.firstName }}
            {{ data.user.lastName }}
          </mat-card-title>
          <button mat-icon-button mat-dialog-close class="ml-2">
            <mat-icon>close</mat-icon>
          </button>
        </mat-card-header>
        <mat-card-content
          class="h-full overflow-y-auto"
          style="max-height: calc(100% - 60px);"
        >
          <!-- User Information -->
          <div class="grid md:grid-cols-2 gap-4 pb-3 border-b mb-4">
            <div class="w-full">
              <label class="font-medium text-gray-600 text-xs" i18n
                >Name:</label
              >
              <div class="text-sm font-medium">
                {{ data.user.firstName }} {{ data.user.lastName }}
              </div>
            </div>
            <div class="w-full">
              <label class="font-medium text-gray-600 text-xs" i18n
                >Email:</label
              >
              <div class="text-sm">{{ data.user.email }}</div>
            </div>
          </div>

          @if (data.questionAnswers && getQuestionAnswers().length > 0) {
          <!-- Questions Summary -->
          <div class="mb-4">
            <h3 class="text-lg font-semibold mb-2" i18n>Questions Summary</h3>
            <p class="text-sm text-gray-600 mb-3">
              <strong>{{ getQuestionAnswers().length }}</strong> question{{
                getQuestionAnswers().length !== 1 ? 's' : ''
              }}
              answered
            </p>
          </div>

          <!-- Individual Questions and Answers -->
          <mat-accordion class="questions-details">
            @for (qa of getQuestionAnswers(); track qa.key) {
            <mat-expansion-panel class="question-item mb-3">
              <mat-expansion-panel-header>
                <mat-panel-title>
                  <strong>{{ qa.question }}</strong>
                </mat-panel-title>
              </mat-expansion-panel-header>

              <div class="question-content pt-3">
                <!-- Full Answer -->
                <div class="mb-3">
                  <div class="mat-elevation-z1 p-4 rounded">
                    <p class="text-sm leading-relaxed">
                      {{ qa.answer || 'No answer provided' }}
                    </p>
                  </div>
                </div>
              </div>
            </mat-expansion-panel>
            }
          </mat-accordion>
          } @else {
          <div class="text-center py-8">
            <mat-icon class="text-6xl text-gray-400 mb-4">quiz</mat-icon>
            <h3 class="text-lg font-medium text-gray-600 mb-2" i18n>
              No Questions Found
            </h3>
            <p class="text-gray-500" i18n>
              This user has not answered any questions yet.
            </p>
          </div>
          }
        </mat-card-content>
      </mat-card>
    </div>
  `,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatExpansionModule,
  ],
})
export class QuestionsModalComponent {
  readonly dialogRef = inject(MatDialogRef<QuestionsModalComponent>);
  readonly data = inject<QuestionsModalData>(MAT_DIALOG_DATA);

  // Map the API response to question-answer pairs
  getQuestionAnswers(): Array<{
    key: string;
    question: string;
    answer: string;
  }> {
    if (!this.data.questionAnswers) return [];

    const questionMap = [
      {
        key: 'definitionOfMarriage',
        question: 'What is your definition of marriage?',
      },
      {
        key: 'expectationsFromPartner',
        question: 'What are your expectations from your partner?',
      },
      {
        key: 'familyBackground',
        question: 'Tell us about your family background',
      },
      {
        key: 'fearsAboutMarriage',
        question: 'What are your fears about marriage?',
      },
      {
        key: 'greatestAdjustment',
        question:
          'What do you think will be your greatest adjustment in marriage?',
      },
      {
        key: 'relationshipWithParentsInlaws',
        question:
          'How do you see your relationship with your parents and in-laws?',
      },
      {
        key: 'timeWithPartner',
        question: 'How do you plan to spend time with your partner?',
      },
      {
        key: 'understandingAboutSex',
        question: 'What is your understanding about sex in marriage?',
      },
      {
        key: 'wishesConcerns',
        question: 'What are your wishes and concerns about marriage?',
      },
      {
        key: 'churchImportance',
        question: 'What is the importance of church in your married life?',
      },
      {
        key: 'ageDifferenceImpact',
        question: 'How do you think age difference will impact your marriage?',
      },
      {
        key: 'eldestYoungestScenario',
        question:
          'How do you handle being the eldest/youngest in family scenarios?',
      },
      {
        key: 'parentsHealthImpact',
        question: "How will your parents' health impact your married life?",
      },
    ];

    return questionMap
      .filter(
        (q) =>
          this.data.questionAnswers[q.key] &&
          this.data.questionAnswers[q.key].trim() !== ''
      )
      .map((q) => ({
        key: q.key,
        question: q.question,
        answer: this.data.questionAnswers[q.key],
      }));
  }
}

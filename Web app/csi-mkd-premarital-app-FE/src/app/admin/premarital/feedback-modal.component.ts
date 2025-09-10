import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule, TitleCasePipe } from '@angular/common';
import {
  MatDialogModule,
  MAT_DIALOG_DATA,
  MatDialogRef,
} from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatExpansionModule } from '@angular/material/expansion';
import { CsiMkdPremaritalAppBeService } from '../../../api/api-main-app/services';
import { InstructorDto } from '../../../api/api-main-app/models';
import classListData from '../../feedback-questions/feedback/class-list.json';

export interface FeedbackModalData {
  user: any;
  feedbackData?: any;
  feedbacks: any;
}

@Component({
  selector: 'app-feedback-modal',
  template: `
    <div
      mat-dialog-content
      class="w-full p-2"
      style="height: calc(95vh - 60px); overflow: hidden;"
    >
      <mat-card class="w-full mx-auto p-4 h-full overflow-hidden">
        <mat-card-header class="mb-3 pb-2 flex justify-between items-center">
          <mat-card-title class="!font-bold text-lg" i18n>
            Feedback Details - {{ data.user.firstName }}
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
              <label class="font-medium text-gray-600 text-sm" i18n
                >Name:</label
              >
              <span class="mt-1 text-base font-medium"
                >{{ data.user.firstName }} {{ data.user.lastName }}</span
              >
            </div>
            <div class="w-full">
              <label class="font-medium text-gray-600 text-sm" i18n
                >Email:</label
              >
              <span class="mt-1 text-base">{{ data.user.email }}</span>
            </div>
          </div>

          @if (data.feedbacks && getObjectKeys(data.feedbacks).length > 0) {
          <!-- Feedback Summary -->
          <div class="mb-4">
            <h3 class="text-lg font-semibold mb-2" i18n>Feedback Summary</h3>
            <p class="text-sm text-gray-600 mb-3">
              <strong>{{ getObjectKeys(data.feedbacks).length }}</strong>
              feedback submission{{
                getObjectKeys(data.feedbacks).length !== 1 ? 's' : ''
              }}
              provided
            </p>
          </div>

          <!-- Individual Feedback Entries -->
          <mat-accordion class="feedback-details">
            @for (feedbackKey of getObjectKeys(data.feedbacks); track
            feedbackKey) { @let feedbackEntry = data.feedbacks[feedbackKey];
            <mat-expansion-panel class="feedback-item">
              <mat-expansion-panel-header>
                <mat-panel-title>
                  <strong>{{ getClassTitle(feedbackKey) }}</strong>
                </mat-panel-title>
              </mat-expansion-panel-header>

              <div class="feedback-content pt-3">
                <!-- Session Metadata -->
                <div class="grid md:grid-cols-2 gap-4 pb-3 border-b mb-3">
                  <div>
                    <label class="font-medium text-gray-600 text-sm" i18n
                      >Date:</label
                    >
                    <p class="text-sm">
                      {{ feedbackEntry.date | date : 'MMM d, y' : '+5:30' }}
                    </p>
                  </div>
                  <div>
                    <label class="font-medium text-gray-600 text-sm" i18n
                      >Instructor:</label
                    >
                    <p class="text-sm">
                      {{
                        feedbackEntry.instructorId
                          ? getInstructorName(feedbackEntry.instructorId)
                          : 'N/A'
                      }}
                    </p>
                  </div>
                </div>

                <!-- Ratings -->
                @if (feedbackEntry.ratings) {
                <div class="mb-4">
                  <h4 class="text-base font-semibold mb-2" i18n>
                    Session Ratings
                  </h4>
                  <div class="flex flex-wrap gap-6">
                    @for (ratingKey of getObjectKeys(feedbackEntry.ratings);
                    track ratingKey) {
                    <div class="rating-item flex-shrink-0">
                      <label
                        class="block mb-1 text-xs font-medium text-gray-600"
                        >{{ ratingKey | titlecase }}:</label
                      >
                      <div class="flex items-center gap-1">
                        <div class="flex gap-1">
                          @for (star of [1,2,3,4,5]; track star) {
                          <mat-icon
                            color="warn"
                            class="text-sm"
                            [class.text-yellow-500]="
                              star <= feedbackEntry.ratings[ratingKey]
                            "
                          >
                            {{
                              star <= feedbackEntry.ratings[ratingKey]
                                ? 'star'
                                : 'star_border'
                            }}
                          </mat-icon>
                          }
                        </div>
                        <span class="text-xs font-medium"
                          >{{ feedbackEntry.ratings[ratingKey] }}/5</span
                        >
                      </div>
                    </div>
                    }
                  </div>
                </div>
                }

                <!-- Text Responses -->
                @if (feedbackEntry.textResponses) {
                <div class="mb-3">
                  <h4 class="text-base font-semibold mb-2" i18n>
                    Written Feedback
                  </h4>
                  <div class="space-y-2">
                    @for (responseKey of
                    getObjectKeys(feedbackEntry.textResponses); track
                    responseKey) {
                    <div class="text-response">
                      <label
                        class="block mb-1 text-xs font-medium text-gray-600"
                        >{{ responseKey | titlecase }}:</label
                      >
                      <div class="mat-elevation-z1 p-2 rounded">
                        <p class="text-xs leading-tight">
                          {{
                            feedbackEntry.textResponses[responseKey] ||
                              'No response provided'
                          }}
                        </p>
                      </div>
                    </div>
                    }
                  </div>
                </div>
                }
              </div>
            </mat-expansion-panel>
            }
          </mat-accordion>
          } @else {
          <div class="text-center py-8">
            <mat-icon class="text-6xl text-gray-400 mb-4">feedback</mat-icon>
            <h3 class="text-lg font-medium text-gray-600 mb-2" i18n>
              No Feedback Found
            </h3>
            <p class="text-gray-500" i18n>
              This user has not submitted any feedback yet.
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
    TitleCasePipe,
  ],
})
export class FeedbackModalComponent implements OnInit {
  readonly dialogRef = inject(MatDialogRef<FeedbackModalComponent>);
  readonly data = inject<FeedbackModalData>(MAT_DIALOG_DATA);
  private readonly api = inject(CsiMkdPremaritalAppBeService);

  readonly instructors = signal<InstructorDto[]>([]);

  ngOnInit() {
    this.loadInstructors();
  }

  private loadInstructors() {
    this.api.apiInstructorsGet().subscribe({
      next: (instructors) => {
        this.instructors.set(instructors);
      },
      error: (error) => {
        console.error('Error loading instructors:', error);
        this.instructors.set([]);
      },
    });
  }

  // Helper method to get Object keys for template use
  getObjectKeys(obj: any): string[] {
    return obj ? Object.keys(obj) : [];
  }

  // Helper method to get class title from class ID
  getClassTitle(classId: string): string {
    const classItem = classListData.find((item) => item.id === classId);
    return classItem ? classItem.title : `Class ${classId}`;
  }

  // Helper method to get instructor name from instructor ID
  getInstructorName(instructorId: number | string): string {
    const instructorIdNum =
      typeof instructorId === 'string'
        ? parseInt(instructorId, 10)
        : instructorId;
    const instructor = this.instructors().find(
      (inst) => inst.id === instructorIdNum
    );
    return instructor ? instructor.name : `Instructor ID: ${instructorId}`;
  }
}

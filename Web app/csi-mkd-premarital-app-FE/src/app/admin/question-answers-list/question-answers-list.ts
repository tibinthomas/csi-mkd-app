import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatExpansionModule } from '@angular/material/expansion';
import { QuestionAnswersService } from '../../../api/api-main-app/services/question-answers.service';
import { QuestionAnswersResponseDto } from '../../../api/api-main-app/models/question-answers-response-dto';
import { CsiMkdPremaritalAppBeService } from '../../../api/api-main-app/services/csi-mkd-premarital-app-be.service';
import { rxResource } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';
import { switchMap, of, map } from 'rxjs';

@Component({
  selector: 'app-question-answers-list',
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatProgressSpinnerModule,
    MatExpansionModule,
    DatePipe,
  ],
  templateUrl: './question-answers-list.html',
  styleUrl: './question-answers-list.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuestionAnswersList {
  private readonly questionAnswersService = inject(QuestionAnswersService);
  private readonly apiService = inject(CsiMkdPremaritalAppBeService);
  private readonly registrationCache = new Map<string, { name: string; email: string }>();

  readonly questionAnswersResource = rxResource({
    stream: () => this.questionAnswersService.getAllQuestionAnswers().pipe(
      switchMap((questionAnswers) => {
        if (!questionAnswers || questionAnswers.length === 0) {
          return of([]);
        }
        
        // Get all unique registration IDs that we don't have cached
        const uncachedIds = questionAnswers
          .map(qa => qa.premaritalRegistrationId)
          .filter(id => !this.registrationCache.has(id));
        
        if (uncachedIds.length === 0) {
          // All data is cached, return enhanced question answers immediately
          return of(questionAnswers.map(qa => ({
            ...qa,
            participantName: this.registrationCache.get(qa.premaritalRegistrationId)?.name || 'Unknown',
            participantEmail: this.registrationCache.get(qa.premaritalRegistrationId)?.email || 'Unknown',
          })));
        }
        
        // Fetch all registrations to get name and email data
        return this.apiService.apiPremaritalregisterFilterGet({
          page: 1,
          pageSize: 1000,
          search: '',
          unapprovedOnly: false,
          activeSessionOnly: false,
        }).pipe(
          map((response: any) => {
            const data = typeof response === 'string' ? JSON.parse(response) : response;
            const registrations = data.items || [];
            
            // Cache the registration data
            registrations.forEach((reg: any) => {
              this.registrationCache.set(reg.id.toString(), {
                name: `${reg.firstName} ${reg.lastName}`,
                email: reg.email,
              });
            });
            
            // Return enhanced question answers
            return questionAnswers.map(qa => ({
              ...qa,
              participantName: this.registrationCache.get(qa.premaritalRegistrationId)?.name || 'Unknown',
              participantEmail: this.registrationCache.get(qa.premaritalRegistrationId)?.email || 'Unknown',
            }));
          })
        );
      })
    ),
  });

  readonly questionAnswers = computed(() => {
    const data = this.questionAnswersResource.value();
    return Array.isArray(data) ? data : [];
  });

  readonly isLoading = computed(() => this.questionAnswersResource.isLoading());
  readonly error = computed(() => this.questionAnswersResource.error());

  readonly questions = [
    { key: 'definitionOfMarriage', label: 'What is your definition of marriage?' },
    { key: 'wishesConcerns', label: 'What wishes and concerns do you have about marriage?' },
    { key: 'churchImportance', label: '"Church is important for marriage." Why?' },
    { key: 'familyBackground', label: 'Describe your family background' },
    { key: 'parentsHealthImpact', label: 'How did your parent\'s physical and mental health relate to you in growing up?' },
    { key: 'eldestYoungestScenario', label: 'Suppose the woman were the eldest of sisters/brothers and the man was the youngest child in his family and had elder sisters. How will that affect the marriage?' },
    { key: 'expectationsFromPartner', label: 'What are you expecting from your would-be partner?' },
    { key: 'understandingAboutSex', label: 'Your understanding about sex? Who talked with you?' },
    { key: 'fearsAboutMarriage', label: 'What fears/anxieties do you have about marriage?' },
    { key: 'timeWithPartner', label: 'How much time can you spend with your life partner after the marriage?' },
    { key: 'ageDifferenceImpact', label: 'Advantages and disadvantages of the age differences?' },
    { key: 'relationshipWithParentsInlaws', label: 'How would your relationship with your parents and in-laws be during the early years of your marriage?' },
    { key: 'greatestAdjustment', label: 'What will be the greatest adjustment when you are in a new home? What is your approach about family prayer and Sunday church service after your marriage?' },
  ];

  refreshData(): void {
    this.questionAnswersResource.reload();
  }

  getAnswerValue(questionAnswers: QuestionAnswersResponseDto, questionKey: string): string {
    const value = (questionAnswers as any)[questionKey];
    return value || 'No response provided';
  }
}
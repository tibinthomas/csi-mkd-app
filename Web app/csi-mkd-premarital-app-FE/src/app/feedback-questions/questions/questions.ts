import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatCardHeader, MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { ActivatedRoute } from '@angular/router';
import { SpeechRecognitionDirective } from '../../shared/directives/speech-recognition.directive';
import { QuestionAnswersService } from '../../../api/api-main-app/services/question-answers.service';
import { CreateQuestionAnswersDto } from '../../../api/api-main-app/models/create-question-answers-dto';
import { CsiMkdPremaritalAppBeService } from '../../../api/api-main-app/services/csi-mkd-premarital-app-be.service';
import { rxResource } from '@angular/core/rxjs-interop';
import { of } from 'rxjs';

@Component({
  selector: 'app-questions',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardHeader,
    MatCardModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    MatButton,
    SpeechRecognitionDirective,
  ],
  templateUrl: './questions.html',
  styleUrl: './questions.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Questions {
  private fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly questionAnswersService = inject(QuestionAnswersService);
  private readonly api = inject(CsiMkdPremaritalAppBeService);
  private userId = signal<string | null>(null);
  private loadingUserDetails = signal(false);
  userDetails = signal<{ name: string; email: string } | null>(null);
  private submitting = signal(false);
  successMessage = signal<string | null>(null);
  errorMessage = signal<string | null>(null);

  questions = [
    {
      label: $localize`What is your definition of marriage?`,
      controlName: 'definitionOfMarriage',
    },
    {
      label:  $localize`What wishes and concerns do you have about marriage?`,
      controlName: 'wishesConcerns',
    },
    {
      label:  $localize`“Church is important for marriage.” Why?`,
      controlName: 'churchImportance',
    },
    {
      label:  $localize`Describe your family background`,
      controlName: 'familyBackground',
    },
    {
      label:
         $localize`How did your parent’s physical and mental health relate to you in growing up?`,
      controlName: 'parentsHealthImpact',
    },
    {
      label:
         $localize`Suppose the woman were the eldest of sisters/brothers and the man was the youngest child in his family and had elder sisters. How will that affect the marriage?`,
      controlName: 'eldestYoungestScenario',
    },
    {
      label:  $localize`What are you expecting from your would-be partner?`,
      controlName: 'expectationsFromPartner',
    },
    {
      label:  $localize`Your understanding about sex? Who talked with you?`,
      controlName: 'understandingAboutSex',
    },
    {
      label:  $localize`What fears/anxieties do you have about marriage?`,
      controlName: 'fearsAboutMarriage',
    },
    {
      label:
         $localize`How much time can you spend with your life partner after the marriage?`,
      controlName: 'timeWithPartner',
    },
    {
      label:  $localize`Advantages and disadvantages of the age differences?`,
      controlName: 'ageDifferenceImpact',
    },
    {
      label:
        $localize`How would your relationship with your parents and in-laws be during the early years of your marriage?`,
      controlName: 'relationshipWithParentsInlaws',
    },
    {
      label:
        $localize`What will be the greatest adjustment when you are in a new home? What is your approach about family prayer and Sunday church service after your marriage?`,
      controlName: 'greatestAdjustment',
    },
  ];

  form = this.fb.group({
    definitionOfMarriage: ['', Validators.required],
    wishesConcerns: ['', Validators.required],
    churchImportance: ['', Validators.required],
    familyBackground: ['', Validators.required],
    parentsHealthImpact: ['', Validators.required],
    eldestYoungestScenario: ['', Validators.required],
    expectationsFromPartner: ['', Validators.required],
    understandingAboutSex: ['', Validators.required],
    fearsAboutMarriage: ['', Validators.required],
    timeWithPartner: ['', Validators.required],
    ageDifferenceImpact: ['', Validators.required],
    relationshipWithParentsInlaws: ['', Validators.required],
    greatestAdjustment: ['', Validators.required],
  });

  constructor() {
    // Effect to update user details and form when user data loads
    effect(() => {
      const userData = this.userDetailsResource.value();
      if (userData) {
        const parsedUser = JSON.parse(userData as string);
        this.userDetails.set({
          name: `${parsedUser.firstName} ${parsedUser.lastName}`,
          email: parsedUser.email,
        });
      }
    });
  }

  ngOnInit(): void {
    // Get userId from route parameters
    const userId = this.route.snapshot.paramMap.get('userId');
    this.userId.set(userId);

  }

  // Resource to fetch user details from the API
  protected readonly userDetailsResource = rxResource({
    params: () => this.userId(),
    stream: ({ params: userId }) =>
      userId
        ? this.api.apiPremaritalregisterIdGet({
            id: userId,
          })
        : of(null),
  });

  isSubmitting() {
    return this.submitting();
  }

  isLoadingUserDetails() {
    return this.loadingUserDetails();
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    this.successMessage.set(null);
    this.errorMessage.set(null);

    const userId = this.userId();
    if (!userId) {
      this.errorMessage.set(
        'User ID not found in route. Please access this form through the proper link.'
      );
      this.submitting.set(false);
      return;
    }

    const formValue = this.form.value;
    const questionAnswersDto: CreateQuestionAnswersDto = {
      premaritalRegistrationId: userId,
      definitionOfMarriage: formValue.definitionOfMarriage || null,
      wishesConcerns: formValue.wishesConcerns || null,
      churchImportance: formValue.churchImportance || null,
      familyBackground: formValue.familyBackground || null,
      parentsHealthImpact: formValue.parentsHealthImpact || null,
      eldestYoungestScenario: formValue.eldestYoungestScenario || null,
      expectationsFromPartner: formValue.expectationsFromPartner || null,
      understandingAboutSex: formValue.understandingAboutSex || null,
      fearsAboutMarriage: formValue.fearsAboutMarriage || null,
      timeWithPartner: formValue.timeWithPartner || null,
      ageDifferenceImpact: formValue.ageDifferenceImpact || null,
      relationshipWithParentsInlaws:
        formValue.relationshipWithParentsInlaws || null,
      greatestAdjustment: formValue.greatestAdjustment || null,
    };

    this.questionAnswersService
      .createQuestionAnswers({ body: questionAnswersDto })
      .subscribe({
        next: () => {
          this.successMessage.set(
            $localize`Your responses have been submitted successfully!`
          );
          this.form.reset();
          this.submitting.set(false);
        },
        error: (error: unknown) => {
          console.error('Error submitting question answers:', error);
          this.errorMessage.set(
            'There was a problem submitting your form. Please try again.'
          );
          this.submitting.set(false);
        },
      });
  }
}

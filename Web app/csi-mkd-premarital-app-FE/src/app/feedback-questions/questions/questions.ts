import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { MatCardHeader, MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { SpeechRecognitionDirective } from '../../shared/directives/speech-recognition.directive';
import { FeedbackDataService } from '../feedback-data.service';

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
  private readonly feedbackDataService = inject(FeedbackDataService);
  userDetails = { name: '', email: '' };
  private submitting = signal(false);
  successMessage = signal<string | null>(null);
  errorMessage = signal<string | null>(null);

  questions = [
    {
      label: 'What is your definition of marriage?',
      controlName: 'definitionOfMarriage',
    },
    {
      label: 'What wishes and concerns do you have about marriage?',
      controlName: 'wishesConcerns',
    },
    {
      label: '“Church is important for marriage.” Why?',
      controlName: 'churchImportance',
    },
    {
      label: 'Describe your family background',
      controlName: 'familyBackground',
    },
    {
      label:
        'How did your parent’s physical and mental health relate to you in growing up?',
      controlName: 'parentsHealthImpact',
    },
    {
      label:
        'Suppose the woman were the eldest of sisters/brothers and the man was the youngest child in his family and had elder sisters. How will that affect the marriage?',
      controlName: 'eldestYoungestScenario',
    },
    {
      label: 'What are you expecting from your would-be partner?',
      controlName: 'expectationsFromPartner',
    },
    {
      label: 'Your understanding about sex? Who talked with you?',
      controlName: 'understandingAboutSex',
    },
    {
      label: 'What fears/anxieties do you have about marriage?',
      controlName: 'fearsAboutMarriage',
    },
    {
      label:
        'How much time can you spend with your life partner after the marriage?',
      controlName: 'timeWithPartner',
    },
    {
      label: 'Advantages and disadvantages of the age differences?',
      controlName: 'ageDifferenceImpact',
    },
    {
      label:
        'How would your relationship with your parents and in-laws be during the early years of your marriage?',
      controlName: 'relationshipWithParentsInlaws',
    },
    {
      label:
        'What will be the greatest adjustment when you are in a new home? What is your approach about family prayer and Sunday church service after your marriage?',
      controlName: 'greatestAdjustment',
    },
  ];

  form = this.fb.group({
    name: ['', Validators.required],
    email: ['', Validators.required],
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

  ngOnInit(): void {
    const userDetails = this.feedbackDataService.userDetails();
    this.userDetails = {
      name: `${userDetails.FirstName} ${userDetails.LastName}`,
      email: userDetails.Email,
    };
    if (userDetails) {
      this.form.patchValue({
        name: `${userDetails.FirstName} ${userDetails.LastName}`,
        email: userDetails.Email,
      });
    }
  }

  isSubmitting() {
    return this.submitting();
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    this.successMessage.set(null);
    this.errorMessage.set(null);

    // Simulate async save (replace with real API call)
    setTimeout(() => {
      if (Math.random() > 0.2) {
        // success 80% of the time
        this.successMessage.set(
          'Your responses have been submitted successfully!'
        );
        this.form.reset();
      } else {
        this.errorMessage.set(
          'There was a problem submitting your form. Please try again.'
        );
      }
      this.submitting.set(false);
    }, 1500);
  }
}

import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { RouterLink, RouterOutlet } from '@angular/router';
import { AnimateOnScrollDirective } from '../shared/directives/animate-on-scroll.directive'; // adjust path

@Component({
  selector: 'app-about',
  templateUrl: './about.html',
  styleUrl: './about.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    RouterOutlet,
    NgOptimizedImage,
    MatCardModule,
    MatButtonModule,
    AnimateOnScrollDirective,
  ],
})
export class About {
  protected readonly currentYear = signal(new Date().getFullYear());

  readonly services = [
    {
      image: 'assets/individual.jpg',
      title: 'Individual Counselling',
      description:
        'Personal & online sessions for stress, anxiety, grief, and related challenges.',
    },
    {
      image: 'assets/family.jpg',
      title: 'Couple & Family Therapy',
      description:
        'Resolve conflicts and strengthen family relationships with professional guidance.',
    },
    {
      image: 'assets/child.jpg',
      title: 'Child & Adolescent Therapy',
      description:
        'Support for behavioral, academic, emotional development, and career guidance.',
    },
    {
      image: 'assets/child.jpg',
      title: 'Psychodiagnostics',
      description:
        'Assessments for learning difficulties, psychological testing, and career planning.',
    },
    {
      image: 'assets/couple.jpg',
      title: 'Premarital Counselling',
      description:
        'Three-day residential program to prepare couples for a strong and faithful marriage.',
    },

    {
      image: 'assets/individual.jpg',
      title: 'Pre-confirmational Counselling',
      description:
        'A certified half/one day programme to guide and educate youth preparing for confirmation.',
    },
    {
      image: 'assets/individual.jpg',
      title: 'School & College Outreach Programmes',
      subtitle: 'S.H.A.P.E. - Student’s Holistic and Pragmatic Empowerment',
      description:
        'Empowering individuals to ensure holistic wellbeing through counselling and other initiatives.',
    },
  ];

  readonly reasons = [
    {
      title: 'Faith-Sensitive Care',
      description:
        'Confidential counselling with sensitivity to Christian values.',
    },
    {
      title: 'Experienced Team',
      description:
        'Panel of certified psychologists, pastoral counsellors, and clergy.',
      link: '/team-members',
    },
    {
      title: 'Holistic Healing',
      description:
        'Integration of professional therapy with spiritual care and support.',
    },
    {
      title: 'Accessible Services',
      description:
        'Both in-person and online appointments at affordable rates.',
    },
    {
      title: 'Community Outreach',
      description:
        'SHAPE programs, leadership workshops, and mental health campaigns.',
    },
    {
      title: 'Safe Environment',
      description:
        'A non-judgmental and peaceful setting for personal growth and healing.',
    },
  ];
}

import { NgOptimizedImage } from '@angular/common';
import { ChangeDetectionStrategy, Component, signal, computed } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { RouterLink, RouterOutlet } from '@angular/router';
import { AnimateOnScrollDirective } from '../shared/directives/animate-on-scroll.directive';

interface ServiceItem {
  readonly image: string;
  readonly title: string;
  readonly description: string;
  readonly subtitle?: string;
}

interface ReasonItem {
  readonly title: string;
  readonly description: string;
  readonly link?: string;
}

interface HeroContent {
  readonly title: string;
  readonly subtitle: string;
  readonly location: string;
  readonly backgroundImage: string;
}

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
  private readonly _currentYear = signal(new Date().getFullYear());
  
  readonly currentYear = computed(() => this._currentYear());
  
  readonly heroContent: HeroContent = {
    title: $localize`:@@CSI Counselling Centre Title:CSI Counselling Centre, Kottayam`,
    subtitle: $localize`:@@CSI Counselling Centre Subtitle:Healing Minds. Empowering Lives.`,
    location: $localize`:@@CSI Counselling Centre Location:Diocese of Madhya Kerala | CMS Press Compound, Kottayam-1`,
    backgroundImage: 'assets/who-we-are.png'
  };

  readonly whoWeAreContent = {
    title: $localize`:@@Who We Are Title:Who We Are`,
    description: $localize`:@@Who We Are Description:With the blessing of Bishop Rt. Rev. Dr. Malayil Sabu Koshy Cherian, the CSI Counselling Centre offers holistic healing through compassionate, confidential, and evidence-based counselling. Our services are guided by a commitment to mental, emotional, and spiritual well-being.`,
    image: 'assets/logo.png'
  };

  readonly services: readonly ServiceItem[] = [
    {
      image: 'assets/individual.png',
      title: $localize`:@@Individual Counselling:Individual Counselling`,
      description: $localize`:@@Individual Counselling Description:Personal & online sessions for stress, anxiety, grief, and related challenges.`,
    },
    {
      image: 'assets/family.jpg',
      title: $localize`:@@Couple & Family Therapy:Couple & Family Therapy`,
      description: $localize`:@@Couple & Family Therapy description:Resolve conflicts and strengthen family relationships with professional guidance.`,
    },
    {
      image: 'assets/child.png',
      title: $localize`:@@Child & Adolescent Therapy:Child & Adolescent Therapy`,
      description: $localize`:@@Child & Adolescent Therapy description:Support for behavioral, academic, emotional development, and career guidance.`,
    },
    {
      image: 'assets/psydiag.jpg',
      title: $localize`:@@Psychodiagnostics:Psychodiagnostics`,
      description: $localize`:@@Psychodiagnostics description:Assessments for learning difficulties, psychological testing, and career planning.`,
    },
    {
      image: 'assets/premarital.jpeg',
      title: $localize`:@@Premarital Counselling:Premarital Counselling`,
      description: $localize`:@@Premarital Counselling description:Three-day residential program to prepare couples for a strong and faithful marriage.`,
    },
    {
      image: 'assets/confirm.png',
      title: $localize`:@@Pre-confirmational Counselling:Pre-confirmational Counselling`,
      description: $localize`:@@Pre-confirmational Counselling description:A certified half/one day programme to guide and educate youth preparing for confirmation.`,
    },
    {
      image: 'assets/shape.jpeg',
      title: $localize`:@@School & College Outreach Programmes:School & College Outreach Programmes`,
      subtitle: $localize`:@@School & College Outreach Programmes subtitle:S.H.A.P.E. - Student's Holistic and Pragmatic Empowerment`,
      description: $localize`:@@School & College Outreach Programmes description:Empowering individuals to ensure holistic wellbeing through counselling and other initiatives.`,
    },
  ] as const;

  readonly reasons: readonly ReasonItem[] = [
    {
      title: $localize`:@@Faith-Sensitive Care:Faith-Sensitive Care`,
      description: $localize`:@@Faith-Sensitive Care description:Confidential counselling with sensitivity to Christian values.`,
    },
    {
      title: $localize`:@@Experienced Team:Experienced Team`,
      description: $localize`:@@Experienced Team description:Panel of certified psychologists, pastoral counsellors, and clergy.`,
      link: '/team-members',
    },
    {
      title: $localize`:@@Holistic Healing:Holistic Healing`,
      description: $localize`:@@Holistic Healing description:Integration of professional therapy with spiritual care and support.`,
    },
    {
      title: $localize`:@@Accessible Services:Accessible Services`,
      description: $localize`:@@Accessible Services description:Both in-person and online appointments at affordable rates.`,
    },
    {
      title: $localize`:@@Community Outreach:Community Outreach`,
      description: $localize`:@@Community Outreach description:SHAPE programs, leadership workshops, and mental health campaigns.`,
    },
    {
      title: $localize`:@@Safe Environment:Safe Environment`,
      description: $localize`:@@Safe Environment description:A non-judgmental and peaceful setting for personal growth and healing.`,
    },
  ] as const;

  readonly sectionTitles = {
    services: $localize`:@@Our Services Title:Our Services`,
    whyChooseUs: $localize`:@@Why Choose Us Title:Why Choose Us?`,
    bookAppointment: $localize`:@@Book Appointment Button:Book Appointment`
  };

  trackByServiceTitle(_index: number, item: ServiceItem): string {
    return item.title;
  }

  trackByReasonTitle(_index: number, item: ReasonItem): string {
    return item.title;
  }
}

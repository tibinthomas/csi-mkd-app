import { NgOptimizedImage } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  signal,
  computed,
} from '@angular/core';
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
    backgroundImage: 'assets/who-we-are.png',
  };

  readonly whoWeAreContent = {
    title: $localize`:@@Who We Are Title:Who We Are`,
    description: $localize`:@@Who We Are Description:With the blessing of Bishop Rt. Rev. Dr. Malayil Sabu Koshy Cherian, the CSI Counselling Centre offers holistic healing through compassionate, confidential, and evidence-based counselling. Our services are guided by a commitment to mental, emotional, and spiritual well-being.`,
    image: 'assets/logo.png',
  };

  readonly services: readonly ServiceItem[] = [
    {
      image: 'assets/individual.png',
      title: $localize`:@@Individual Counselling:Individual Counselling`,
      description: $localize`:@@Individual Counselling Description:Personal & online sessions for stress, anxiety, grief, and related challenges.`,
    },
    {
      image: 'assets/general.jpg',
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
    bookAppointment: $localize`:@@Book Appointment Button:Book Appointment`,
  };

  trackByServiceTitle(_index: number, item: ServiceItem): string {
    return item.title;
  }

  trackByReasonTitle(_index: number, item: ReasonItem): string {
    return item.title;
  }

  readonly historyContent: HistoryEvent[] = [
    {
      year: '2006-2008',
      title: $localize`:@@History Title 1:The Beginning`,
      description: $localize`:@@History Paragraph 1:To have a pre-marital counselling centre for the CSI Diocese of Madhya Kerala was a felt need addressed at the Diocesan Council meeting of 2006, which was reinforced in the 2007 session. Concrete steps towards this came up with the Bishop Rt. Rev. Thomas Samuel calling up a meeting of counsellors in December 2007. The first major decision was to organise one-day, pre-marital counselling classes in all the twelve clergy districts. The first programme was conducted at the Kottayam clergy district, which was inaugurated by the Diocesan Bishop at Manganam St. John’s CSI Church on 19 January 2008.`,
    },
    {
      year: '2008',
      title: $localize`:@@History Title 2:Growing Momentum`,
      description: $localize`:@@History Paragraph 2:In the premarital counselling conducted at Kottayam 125 people attended, while the momentum at the Ettumanoor Clergy District premarital programme was a milestone which saw more than 300 young men and women in attendance. This was then soon spread to other clergy districts too.`,
    },
    {
      year: '2008-2009',
      title: $localize`:@@History Title 3:Residential Camps`,
      description: $localize`:@@History Paragraph 3:In the initial years, the counselling sessions were organised under the auspices of the Bishop Mani Theological Institute, with the participants given BMTI certification. Introduction of two-day residential Pre-Marital camp was a meaningful progress, with three such programmes organised in 2008. From January 2009 onwards, camps organised by BMTI were held every month at the Kottayam CSI Retreat Centre. And the numbers attending these camps came up to even 100.`,
    },
    {
      year: '2011-2012',
      title: $localize`:@@History Title 4:Official Inauguration`,
      description: $localize`:@@History Paragraph 4:The inauguration of the CSI Counselling Centre was conducted by the Diocesan Bishop Rt. Rev. Thomas K Oommen on the Diocesan Day 25 July 2011. The Centre was housed in the CMS Press compound. Three-day camps commenced in 2011; the first newsletter “Insight” came out in 2012. The same year saw the publication of the book “Vadhoovaranmaarude Gurukulam” (Couples’ Academic Sanctuary).`,
    },
    {
      year: '2014-2024',
      title: $localize`:@@History Title 5:Expansion & Relocation`,
      description: $localize`:@@History Paragraph 5:Two pre-marital counselling courses were conducted every month from 2014 onwards. The second segment of the three-day camp commenced in January 2014 at Bethel Ashramam, Varikkad (Thiruvalla), which was to happen from the third Thursday to Saturday of each month. From 2017, this was relocated to the Eco-spirituality Centre, Othera. In 2024 the three-day premarital camp was fixed to conducted only in the first Thursday to Saturday every month at CSI retreat centre Kottayam.`,
    },
    {
      year: '2019-2021',
      title: $localize`:@@History Title 6:Community Outreach`,
      description: $localize`:@@History Paragraph 6:The centre started Counselling with focus on individuals, schools and communities with classes in ten selected schools. Regular programmes were organised at the Kottayam CNI TTI and Baker Memorial Girls Higher Secondary School. In 2019-21 introduced The SHAPE (Students’ Holistic and Pragmatic Empowerment) programme as the students’ empowerment programme.`,
    },
    {
      year: '2025',
      title: $localize`:@@History Title 7:Academic Partnership`,
      description: $localize`:@@History Paragraph 7:From 11th August 2025 onwards, a joint venture between the CSI Counseling Centre, Kottayam, under the SHAPE (Students Holistic and Pragmatic Empowerment) Project, and the Department of Psychology, Baker College for Women, Kottayam inaugurated an Add-On Programme in Counselling Psychology.`,
    },
    {
      year: '2025',
      title: $localize`:@@History Title 8:Digital Transformation`,
      description: $localize`:@@History Paragraph 8:On 6 September 2025, inauguration of our Counselling Centre web app by the esteemed Bishop, the Rt. Revd. Dr. Malayil Sabu Koshy Cherian. Where the new digital platform greatly enhance ability to provide ease to registration and accessible support.`,
    },
    {
      year: '2025',
      title: $localize`:@@History Title 9:Pre-confirmational Counselling`,
      description: $localize`:@@History Paragraph 9:The inaugural Pre-confirmational Counselling session was successfully held at St. Thomas CSI Church, Kollam, on October 18, 2025. A total of 14 candidates participated and greatly benefitted from the guidance. Which followed by other churches of our diocese. The Pre-confirmational Counselling focuses on equipping our teenagers who are preparing for confirmation with essential life skills. The unique counselling program goes beyond the doctrines to focus on Self-Awareness, Healthy Friendships, Healthy relationships and Future Orientation. It gives our teen the tools they need to live their faith powerfully in a changing world.`,
    },
    {
      year: 'Present',
      title: $localize`:@@History Title 10:Continuing the Mission`,
      description: $localize`:@@History Paragraph 10:The Diocesan Counselling Centre continues its ministry as a guide and support to many, acting as a mentoring space for couples and individuals, thus attempting to fulfil its call to counsel to the mind and care for the soul.`,
    },
  ];

  readonly directors: DirectorItem[] = [
    {
      tenure: '2011 July – 2014 April',
      name: 'Rev. Mathew Jillow Ninan, Director / Rev. Abraham C Prakash, Convenor',
    },
    {
      tenure: '2014 May – 2016 April',
      name: 'Rev. Abraham C Prakash, Director',
    },
    {
      tenure: '2016 May – 2017 Nov',
      name: 'Rev. Santhosh Mathew, Director',
    },
    {
      tenure: '2017 Dec – 2021 Apr',
      name: 'Rev. Mathew Jillow Ninan, Director',
    },
    {
      tenure: '2019 – 2021',
      name: 'Rev. Deebu Aby John, Associate Director',
    },
    {
      tenure: '2021 May – 2025 April',
      name: 'Rev. Jacob Johnson, Director',
    },
    {
      tenure: '2025 May – Present',
      name: 'Rev. Robin Mathew John, Director',
    },
  ];
}

interface DirectorItem {
  tenure: string;
  name: string;
}

interface HistoryEvent {
  year: string;
  title: string;
  description: string;
}

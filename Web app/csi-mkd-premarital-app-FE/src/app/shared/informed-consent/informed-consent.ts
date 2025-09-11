import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
  inject,
  Inject,
} from '@angular/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonModule } from '@angular/material/button';
import {
  MatDialogModule,
  MatDialog,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-informed-consent-dialog',
  imports: [
    MatCheckboxModule,
    MatButtonModule,
    FormsModule,
    MatDialogModule,
    MatIconModule,
  ],
  template: `
    <div class="consent-dialog">
      <div class="dialog-header">
        <button
          mat-icon-button
          mat-dialog-close="cancel"
          class="close-button"
          aria-label="Close dialog"
          type="button"
        >
          <mat-icon>close</mat-icon>
        </button>
      </div>

      <mat-dialog-content class="consent-content">
        <!-- Premarital Counseling Section -->
        <section class="consent-section">
          <h4>Informed Consent for Premarital Counseling Camp</h4>

          <h5>1. Nature and Goals of Premarital Counseling</h5>
          <p>
            This premarital counseling camp is a structured program by CSI
            MADHYA KERALA DIOCESE designed to help couples build a strong,
            healthy foundation for their marriage. Our goals include:
          </p>
          <ul>
            <li>Improving communication and conflict-resolution skills.</li>
            <li>
              Exploring expectations about marriage, finances, roles, and
              family.
            </li>
            <li>Identifying and discussing core values and beliefs.</li>
            <li>Providing tools and strategies for a lifelong partnership.</li>
          </ul>
          <p>
            The camp involves group sessions, couple activities, and educational
            workshops led by qualified counselors. It is not intended to be a
            substitute for individual or intensive couples therapy for severe
            issues.
          </p>

          <h5>2. Confidentiality and Its Limits</h5>
          <p>
            Confidentiality is a cornerstone of our work. Everything you share
            in your private sessions with a counselor will remain confidential.
            However, there are legal and ethical limits to this confidentiality:
          </p>
          <ul>
            <li>
              <strong>Threat of Harm:</strong> If a counselor believes a
              participant is at risk of harming themselves or another person,
              they are legally and ethically obligated to intervene to ensure
              safety.
            </li>
            <li>
              <strong>Abuse or Neglect:</strong> Suspicions of child, elder, or
              dependent adult abuse or neglect must be reported to the
              appropriate authorities.
            </li>
            <li>
              <strong>Court Order:</strong> If a court orders the release of
              records, the counselor must comply.
            </li>
          </ul>
          <p>
            In group settings, we ask all participants to respect the privacy of
            others and maintain confidentiality by not sharing what is discussed
            outside of the group.
          </p>

          <h5>3. Camp Policies and Fees</h5>
          <ul>
            <li>
              You have to attend the premarital counselling starts on Thursday
              9:30am till Saturday 11:00am.
            </li>
            <li>
              You have to bring all necessary things for the three day
              premarital counselling camp including a Bible.
            </li>
            <li>
              You have to bring atleast one of your parent to the last session
              (sacramentality of marriage and marriage rehearsal) of the camp.
            </li>
            <li>
              <strong>Attendance:</strong> Full participation in all scheduled
              sessions and activities is expected to get the most out of the
              experience.
            </li>
            <li>
              <strong>Fees:</strong> The cost for the premarital counseling camp
              is fixed as per the decision of core committee of the CSI
              COUNSELLING CENTER KOTTAYAM. This fee covers all workshops,
              materials, food, stay and if any private session with a counselor.
              Payment should be done in full at the registration office before
              commencement of the camp.
            </li>
            <li>
              <strong>Cancellation Policy:</strong> Cancellations made at least
              1 week before the start of the camp. No refunds will be issued for
              cancellations made after this date.
            </li>
          </ul>

          <h5>4. Participant Rights and Responsibilities</h5>
          <p>
            <strong>Your Rights:</strong> You have the right to ask questions
            about the counseling process, to decide what you wish to share in
            the camp at any time.
          </p>
          <p>
            <strong>Your Responsibilities:</strong> To ensure a successful
            experience, we ask that you commit to active and open participation,
            treating all counselors and fellow participants with respect, and
            being willing to explore difficult topics honestly with your
            partner.
          </p>
        </section>

        <!-- General Counseling Section -->
        <section class="consent-section">
          <h4>Informed Consent and Intake Form</h4>
          <p>
            Please read through the following informed consent agreement. In
            general, what are listed below are the responsibilities and
            obligations of your therapist, and also some expectations of you as
            the client. This document also contains important information about
            our professional services and business policies.
          </p>

          <h5>Psychotherapy</h5>
          <ul>
            <li>
              <strong>Voluntary Participation:</strong> All clients voluntarily
              agree to treatment, and accordingly may terminate if they wish to
              do so.
            </li>
            <li>
              <strong>Client Involvement:</strong> All clients are expected to
              show up to appointments on time, be prepared to focus on and
              discuss therapy goals and issues, and will not attend while under
              the influence of non-prescribed and/or illicit drugs, or alcohol.
            </li>
            <li>
              <strong>Guarantees:</strong> The majority of people do get better
              in therapy and accordingly, your therapist makes NO guarantee of
              results.
            </li>
            <li>
              <strong>Risks of Therapy:</strong> Just as medications sometimes
              cause unexpected side effects, counselling can stimulate painful
              memories, unanticipated changes in your life, and uncomfortable
              feelings like sadness, guilt, anger, frustration, loneliness, and
              helplessness.
            </li>
            <li>
              <strong>Benefits of Therapy:</strong> The benefits of therapy can
              include: a higher level of functional coping, solutions to
              specific problems, new insights into self, more effective means of
              communicating in relationships, symptomatic relief, and improved
              self-esteem.
            </li>
          </ul>

          <h5>Confidentiality</h5>
          <p>
            <strong>Confidentiality and Privilege:</strong> The information and
            content shared in therapy will remain confidential, except as noted
            in the exceptions to confidentiality.
          </p>
          <p>
            <strong>Exceptions to Confidentiality and Privilege:</strong> Your
            therapist is legally obligated to violate confidentiality under the
            following circumstances:
          </p>
          <ul>
            <li>
              When the therapist has reason to suspect that the client has been,
              or is currently, involved in the abuse or neglect of a child
            </li>
            <li>
              When the therapist has reason to suspect that the client has been,
              or is currently, involved, in the abuse or neglect of vulnerable
              adults
            </li>
            <li>If a client is pregnant and taking street drugs</li>
            <li>
              If the client reports sexual misconduct by another counsellor
            </li>
            <li>
              If a client is a serious danger to themselves, i.e., if suicidal
            </li>
            <li>
              If a client is a serious danger to someone else, i.e., if
              homicidal
            </li>
            <li>If the courts order copies of records</li>
          </ul>

          <h5>Sessions Policy</h5>
          <ul>
            <li>
              <strong>Meetings:</strong> Once we have agreed to work together,
              we will usually schedule one appointment every 1-2 weeks at a time
              we can agree upon.
            </li>
            <li>
              <strong>Length of Therapy:</strong> The session length typically
              is 45 minutes. Occasionally sessions may run as long as 55-60
              minutes.
            </li>
            <li>
              <strong>Cancellation, No Show or Late Arrival:</strong> In
              general, all clients must provide the therapist with a minimum of
              24 hours notice in the event of a cancellation.
            </li>
          </ul>

          <h5>Financial Agreement and Terms</h5>
          <ul>
            <li>
              <strong>Billing and Payments:</strong> You will be expected to pay
              for each session at the beginning of our meetings.
            </li>
            <li>
              <strong>Copays & Co-insurance:</strong> My signature below
              indicates that I understand and agree to pay for any copays at the
              beginning of my session on the date it is provided.
            </li>
          </ul>

          <h5>Research</h5>
          <p>
            You may choose to participate in our Research Program. Your personal
            health information will be anonymized, meaning your identity will be
            removed. This anonymized data will be used for research purposes
            only.
          </p>
        </section>

        <!-- Checkbox and OK button on same line -->
        <div class="consent-footer">
          <div class="consent-row">
            <div class="consent-checkbox-container">
              <mat-checkbox
                [(ngModel)]="agreed"
                color="primary"
                class="consent-checkbox"
              >
                <span class="checkbox-label">
                  I have read and agree to the Informed Consent and Counseling
                  Agreement
                </span>
              </mat-checkbox>
            </div>
            <div class="ok-button-container">
              <button
                mat-flat-button
                color="primary"
                [mat-dialog-close]="agreed"
                [disabled]="!agreed"
                type="button"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      </mat-dialog-content>
    </div>
  `,
  styles: `
    .consent-dialog {
      width: 100%;
      max-width: 800px;
      padding: 24px;
    }

    .dialog-header {
      display: flex;
      justify-content: flex-end;
      margin-bottom: 16px;
    }

    .close-button {
      position: absolute;
      top: 8px;
      right: 8px;
    }

    .consent-content {
      max-height: 500px;
      overflow-y: auto;
      padding: 20px 0;
      margin: 0 -24px;
      padding-left: 24px;
      padding-right: 24px;
    }

    .consent-section {
      margin-bottom: 30px;
    }

    .consent-section h4 {
      color: var(--mat-sys-color-secondary);
      font-size: 16px;
      font-weight: 600;
      margin-bottom: 15px;
      border-bottom: 2px solid var(--mat-sys-color-secondary);
      padding-bottom: 5px;
    }

    .consent-section h5 {
      color: var(--mat-sys-color-secondary);
      font-size: 14px;
      font-weight: 600;
      margin: 15px 0 8px 0;
    }

    .consent-section p {
      color: var(--mat-sys-color-secondary);
      font-size: 13px;
      line-height: 1.6;
      margin-bottom: 12px;
      text-align: justify;
    }

    .consent-section ul {
      color: var(--mat-sys-color-secondary);
      font-size: 13px;
      line-height: 1.5;
      margin-left: 20px;
      margin-bottom: 12px;
    }

    .consent-section li {
      margin-bottom: 6px;
    }

    .consent-footer {
      margin-top: 30px;
      padding-top: 24px;
      border-top: 1px solid #e0e0e0;
    }

    .consent-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
    }

    .consent-checkbox-container {
      display: flex;
      align-items: center;
      flex: 1;
    }

    .ok-button-container {
      display: flex;
      align-items: center;
    }

    .checkbox-label {
      font-size: 14px;
      font-weight: 500;
      color: var(--mat-sys-color-secondary);
    }

    :host-context(.dark-theme) .consent-footer {
      border-top-color: #616161;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InformedConsentDialogComponent {
  agreed = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { initialAgreed: boolean }
  ) {
    this.agreed = data?.initialAgreed || false;
  }
}

@Component({
  selector: 'app-informed-consent',
  imports: [MatDialogModule],
  template: `
    <div class="consent-link-section">
      <a
        href="#"
        (click)="openConsentDialog($event)"
        class="consent-link"
      >
        Read Informed Consent and Counselling Agreement
      </a>
    </div>
  `,
  styles: `
    .consent-link-section {
      margin: 0;
      padding: 0;
    }

    .consent-link {
      color: var(--mat-sys-color-primary);
      text-decoration: underline;
      font-weight: 500;
      cursor: pointer;
      font-size: 14px;
    }

    .consent-link:hover {
      color: var(--mat-sys-color-primary);
      text-decoration: none;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InformedConsentComponent {
  private readonly dialog = inject(MatDialog);

  agreed = input<boolean>(false);
  agreementChange = output<boolean>();

  openConsentDialog(event: Event): void {
    event.preventDefault();
    const dialogRef = this.dialog.open(InformedConsentDialogComponent, {
      width: '90vw',
      maxWidth: '800px',
      maxHeight: '90vh',
      disableClose: true,
      autoFocus: false,
      restoreFocus: false,
      data: { initialAgreed: this.agreed() },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result === true) {
        this.agreementChange.emit(true);
      } else if (result === 'cancel') {
        // User cancelled, don't change the agreement status
      }
    });
  }
}

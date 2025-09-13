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
  selector: 'app-counseling-consent-dialog',
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
        <!-- Counselling Consent Section -->
        <section class="consent-section">
          <h4>Informed Consent and Intake Form</h4>
          <p>
            (Please read through the following informed consent agreement.)
            What follows is a basic understanding between client and therapist. In general, what are listed below are the responsibilities and obligations of your therapist, and also some expectations of you as the client. This document also contains important information about our professional services and business policies. Do not sign the informed consent unless you completely understand and agree to all aspects. If you have any questions, please bring this up at your next session, so you and your therapist can go through this document in as much detail as is needed. When you sign this document, you will sign an agreement between us.
          </p>

          <h5>Psychotherapy</h5>
          <p>
            <strong>Voluntary Participation:</strong> All clients voluntarily agree to treatment, and accordingly may terminate if they wish to do so.
          </p>
          <p>
            <strong>Client Involvement:</strong> All clients are expected to show up to appointments on time, be prepared to focus on and discuss therapy goals and issues, and will not attend while under the influence of non-prescribed and/or illicit drugs, or alcohol. All clients are expected to be open and honest so your therapist can assist you with your goals. Therapy calls for a very active effort on your part. In order for therapy to be successful, you are encouraged to work on things we talk about both during our sessions and at home. Inconsistent attendance can negatively affect your therapy progress.
          </p>
          <p>
            <strong>Guarantees:</strong> The majority of people do get better in therapy and accordingly, your therapist makes NO guarantee of results. It is not possible to guarantee results such as: becoming happier, saving marriages, stopping drug abuse, becoming less depressed, and so forth.
          </p>
          <p>
            <strong>Risks of Therapy:</strong> Just as medications sometimes cause unexpected side effects, counselling can stimulate painful memories, unanticipated changes in your life, and uncomfortable feelings like sadness, guilt, anger, frustration, loneliness, and helplessness. In some cases client's symptoms become worse during the course of therapy, occasionally necessitating hospitalization. Another risk of therapy is that throughout the process of therapeutic change, it is not uncommon for clients to reach a point of change where they may feel they are different and no longer able to be the same person they were upon entering therapy. At times these feelings can be unsettling.
          </p>
          <p>
            <strong>Benefits of Therapy:</strong> The benefits of therapy can include: a higher level of functional coping, solutions to specific problems, new insights into self, more effective means of communicating in relationships, symptomatic relief, and improved self-esteem.
          </p>

          <h5>Therapist</h5>
          <p>
            <strong>Credentials and Qualifications:</strong> Counselors at Innovative Psychological Consultants hold a variety of degrees in the field of psychology such as Masters or Doctoral Degrees in Psychology, Family Therapy, and Psychiatry. You can check the therapist's profiles and qualifications here.
          </p>
          <p>
            <strong>Therapist Involvement:</strong> Your therapist will be prepared at the designated time, (barring emergencies), and will be attentive and supportive in meeting the therapy goals and do everything possible to assist you in achieving a greater sense of self-awareness and work toward helping you resolve problem areas.
          </p>
          <p>
            <strong>Counselling Approach & Theory:</strong> At Mind and Brain, we believe that each individual is different and unique and as such do not limit ourselves to any 1 approach. Your therapist generally uses an eclectic therapy approach and may use different evidence modalities as the need arises. Your counsellor focuses largely on client responsibility in therapy, building a relationship with clients, creating a nurturing environment conducive to change, exploration of past events and how they continue to affect you today, analysis of underlying belief systems and their relation to inadequate functioning or hindrance to change, and implementation of specific emotional, cognitive, and behavioural techniques designed to aid in change toward specified goals.
          </p>
          <p>
            <strong>Colleague Consultation and Peer Supervision:</strong> In keeping with standards of practice, your therapist may consult with other mental health professionals regarding the care and management of cases. The purpose of this consultation is to ensure quality of care. Your therapist will maintain complete confidentiality and protect your identity by not using real names or any identifying information.
          </p>

          <h5>Confidentiality</h5>
          <p>
            <strong>Confidentiality and Privilege:</strong> The information and content shared in therapy will remain confidential, except as noted in the next section: Exceptions to Confidentiality and Privilege. Your information will not be shared with anyone without your written consent. Your information is also privileged, which means that your therapist is free from the duty to speak in court about your counselling unless you waive that right, or a judge orders it.
          </p>
          <p>
            <strong>Patient Records:</strong> In compliance with the Mental Health Act of India, patient records, including assessment reports and session summaries, will be retained for the legally mandated duration. Patients may request access to their medical records at any time with a week's notice.
          </p>
          <p>
            <strong>Exceptions to Confidentiality and Privilege:</strong> Your therapist is legally obligated to violate confidentiality under the following circumstances:
          </p>
          <ul>
            <li>When the therapist has reason to suspect that the client has been, or is currently, involved in the abuse or neglect of a child</li>
            <li>When the therapist has reason to suspect that the client has been, or is currently, involved, in the abuse or neglect of vulnerable adults</li>
            <li>If a client is pregnant and taking street drugs</li>
            <li>If the client reports sexual misconduct by another counsellor</li>
            <li>If a client is a serious danger to themselves, i.e., if suicidal</li>
            <li>If a client is a serious danger to someone else, i.e., if homicidal</li>
            <li>If the courts order copies of records</li>
          </ul>
          <p>
            Confidentiality has limitations for minor clients. Parents and guardians have the legal right to access a minor client's records. Minor clients do have the right to complete confidentiality in obtaining counselling for pregnancies and associated conditions, sexually transmitted diseases, and information about alcohol or drug abuse.
          </p>

          <h5>Sessions Policy</h5>
          <p>
            <strong>Meetings:</strong> Once we have agreed to work together, we will usually schedule one appointment every 1-2 weeks at a time we can agree upon. Therapy sessions typically warrant intervals of at least 5-7 days between sessions and the frequency will be suggested by the therapist based on the client's needs and availability.
          </p>
          <p>
            <strong>Length of Therapy:</strong> The session length typically is 45 minutes. Occasionally sessions may run as long as 55-60 minutes. Because our meetings are your time, you are expected to come to each session with a sense of what it is you would like to discuss or work on during that particular session.
          </p>
          <p>
            The length of therapy is quite variable based on client motivation, the number and severity of issues to resolve, and work efforts outside of therapy sessions. On average, many people feel they have obtained what they were looking for in 10-25 sessions. For some, it is fewer and for others, it may go longer.
          </p>
          <p>
            <strong>Cancellation, No Show or Late Arrival:</strong> In general, all clients must provide the therapist with a minimum of 24 hours notice in the event of a cancellation. Clients will be charged for appointments that are not cancelled at least 24 hours in advance and for all no-shows. A one-time emergency can be Any emergencies will be decided on a case-by-case basis Clients arriving late will not be provided with an extension of time beyond what they were scheduled so as not to disrupt other client appointments. No reduction in fees will result from shortened sessions due to a client's late arrival.
          </p>
          <p>
            <strong>Termination:</strong> Either the client or the therapist may end therapy at any time. Your voluntary involvement allows you to discontinue at any time. If your therapist feels you are no longer benefiting from therapy or your therapist feels there is a conflict in values they may discuss termination. If you desire additional counseling your therapist will provide you with a referral competent to address your issues.
          </p>

          <h5>Professional Fees</h5>
          <p>
            Therapists may schedule diagnostic sessions at the start or when a need arises, which is more expensive. Follow-up therapy sessions are less expensive. Fees vary for other services provided such as testing or psychiatry. A fee schedule for services can be provided at your request.
          </p>

          <h5>Research</h5>
          <p>
            You may choose to participate in our Research Program. Your personal health information will be anonymized, meaning your identity will be removed. This anonymized data will be used for research purposes only. It will help us measure the effectiveness and efficiency of our treatments and services. Additionally, anonymized data is often used in scientific research publications to share findings with the broader medical community.
          </p>
          <p>
            You have the option to voluntarily consent to the use of your anonymized data for research purposes. You can withdraw your consent at any time, and we will ensure that your data is removed from our research database. Additionally, you can request that your data be redacted from any future publications.
          </p>
          <p>
            Please note that once your anonymized data has been published or submitted for publication, it may not be possible to redact it. This is because published material is generally considered public information.
          </p>

          <h5>Consent and Agreement</h5>
          <p>
            I hereby make my full consent that I have read and fully understand 
            the information provided in this consent form. I voluntarily agree 
            to participate in the counseling sessions and commit to the 
            policies and responsibilities outlined above.
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
                  I have read and agree to the Informed Consent and Counseling Agreement
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
export class CounselingConsentDialogComponent {
  agreed = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { initialAgreed: boolean }
  ) {
    this.agreed = data?.initialAgreed || false;
  }
}

@Component({
  selector: 'app-counseling-consent',
  imports: [MatDialogModule],
  template: `
    <div class="consent-link-section">
      <a href="#" (click)="openConsentDialog($event)" class="consent-link">
        Read and Accept Informed Consent and Counselling Agreement
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
export class CounselingConsentComponent {
  private readonly dialog = inject(MatDialog);

  agreed = input<boolean>(false);
  agreementChange = output<boolean>();

  openConsentDialog(event: Event): void {
    event.preventDefault();
    const dialogRef = this.dialog.open(CounselingConsentDialogComponent, {
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
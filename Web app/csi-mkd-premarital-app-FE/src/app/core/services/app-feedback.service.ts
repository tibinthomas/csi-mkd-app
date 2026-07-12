import { Injectable, inject } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { AppFeedbackDialog } from '../../shared/components/app-feedback-dialog/app-feedback-dialog';

interface AppFeedbackState {
  visits: number;
  submitted?: boolean;
  snoozeUntil?: number;
}

const STORAGE_KEY = 'csi-app-feedback';
const SESSION_KEY = 'csi-app-feedback-session';
const PROMPT_DELAY_MS = 30_000; // wait until the visitor has settled in
const MIN_VISITS_BEFORE_PROMPT = 2; // never on the first visit
const SNOOZE_DAYS = 14; // if dismissed, stay quiet for two weeks
const POST_SUBMISSION_DELAY_MS = 800; // breathing room after the success dialog closes

/**
 * Coordinates the "rate this app" dialog: a deliberately quiet auto-prompt
 * (second browser session onwards, after 30s, snoozed on dismissal, never
 * again once submitted) plus manual opening from the toolbar button.
 */
@Injectable({ providedIn: 'root' })
export class AppFeedbackService {
  private readonly dialog = inject(MatDialog);
  private readonly router = inject(Router);
  private promptedThisSession = false;
  private openRef: MatDialogRef<AppFeedbackDialog> | null = null;

  /** Called from the public layout; counts at most one visit per browser session. */
  registerVisitAndMaybePrompt(): void {
    // The layout re-mounts on every public<->admin hop; only the first mount
    // of a browser session counts as a visit.
    try {
      if (sessionStorage.getItem(SESSION_KEY)) {
        return;
      }
      sessionStorage.setItem(SESSION_KEY, '1');
    } catch {
      // storage unavailable — fall through, worst case we count extra visits
    }

    const state = this.read();
    state.visits = (state.visits || 0) + 1;
    this.write(state);

    if (
      this.promptedThisSession ||
      state.submitted ||
      state.visits < MIN_VISITS_BEFORE_PROMPT ||
      (state.snoozeUntil && Date.now() < state.snoozeUntil)
    ) {
      return;
    }

    this.promptedThisSession = true;
    setTimeout(() => this.open(true), PROMPT_DELAY_MS);
  }

  /**
   * Invites feedback right after a completed registration — the moment the
   * visitor has finished what they came for. Stays quiet if they already
   * submitted feedback or recently dismissed the dialog.
   */
  promptAfterSubmission(): void {
    const state = this.read();
    if (
      state.submitted ||
      (state.snoozeUntil && Date.now() < state.snoozeUntil)
    ) {
      return;
    }
    // Let the post-registration navigation settle before the dialog appears
    setTimeout(() => this.open(true), POST_SUBMISSION_DELAY_MS);
  }

  /** Opens the feedback dialog (from the auto prompt or the toolbar button). */
  open(auto = false): void {
    // Never two feedback dialogs at once
    if (this.openRef) {
      return;
    }
    // The auto prompt must stay on public pages and out of other dialogs' way
    if (
      auto &&
      (this.router.url.startsWith('/admin') ||
        this.dialog.openDialogs.length > 0)
    ) {
      return;
    }
    this.openRef = this.dialog.open(AppFeedbackDialog, {
      width: '24rem',
      maxWidth: '92vw',
      autoFocus: false,
      panelClass: 'app-feedback-panel',
    });
    this.openRef.afterClosed().subscribe((submitted: boolean) => {
      this.openRef = null;
      const state = this.read();
      if (submitted) {
        state.submitted = true;
      } else {
        state.snoozeUntil = Date.now() + SNOOZE_DAYS * 24 * 60 * 60 * 1000;
      }
      this.write(state);
    });
  }

  private read(): AppFeedbackState {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    } catch {
      return { visits: 0 };
    }
  }

  private write(state: AppFeedbackState): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // storage unavailable (private mode) — the prompt simply won't persist
    }
  }
}

import { CanDeactivateFn } from '@angular/router';

export interface HasPendingChanges {
  hasPendingChanges: () => boolean;
}

export const pendingChangesGuard: CanDeactivateFn<HasPendingChanges> = (
  component: HasPendingChanges
) => {
  if (component?.hasPendingChanges && component.hasPendingChanges()) {
    return confirm('You have unsaved changes. Are you sure you want to leave this page?');
  }
  return true;
};



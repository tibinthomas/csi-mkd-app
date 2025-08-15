import { CanDeactivateFn } from '@angular/router';
import { Observable } from 'rxjs';

/**
 * Interface for components that may have pending changes
 * that should be confirmed before navigation.
 */
export interface HasPendingChanges {
  /**
   * Returns true if the component has unsaved changes.
   */
  hasPendingChanges(): boolean;
  
  /**
   * Optional method to provide custom confirmation logic.
   * If not implemented, a default browser confirm dialog is used.
   */
  confirmNavigation?(): Observable<boolean> | Promise<boolean> | boolean;
}

/**
 * Route guard that prevents navigation away from a component
 * with unsaved changes without user confirmation.
 */
export const pendingChangesGuard: CanDeactivateFn<HasPendingChanges> = (
  component: HasPendingChanges
): Observable<boolean> | Promise<boolean> | boolean => {
  // If component doesn't implement the interface, allow navigation
  if (!component?.hasPendingChanges) {
    return true;
  }

  // If no pending changes, allow navigation
  if (!component.hasPendingChanges()) {
    return true;
  }

  // Use custom confirmation logic if available
  if (component.confirmNavigation) {
    return component.confirmNavigation();
  }

  // Default browser confirmation dialog
  return confirm(
    'You have unsaved changes. Are you sure you want to leave this page?'
  );
};



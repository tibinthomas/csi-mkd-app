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
  
  /**
   * Optional method called when navigation is cancelled.
   * Use this to reset loading states or perform cleanup.
   */
  onNavigationCancelled?(): void;
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
    const result = component.confirmNavigation();
    
    // Handle the result to call onNavigationCancelled when needed
    if (result instanceof Promise) {
      return result.then((confirmed: boolean) => {
        if (!confirmed && component.onNavigationCancelled) {
          component.onNavigationCancelled();
        }
        return confirmed;
      });
    } else if (result instanceof Observable) {
      return new Promise((resolve) => {
        result.subscribe((confirmed: boolean) => {
          if (!confirmed && component.onNavigationCancelled) {
            component.onNavigationCancelled();
          }
          resolve(confirmed);
        });
      });
    } else {
      // Synchronous result
      if (!result && component.onNavigationCancelled) {
        component.onNavigationCancelled();
      }
      return result;
    }
  }

  // Default browser confirmation dialog
  const confirmed = confirm(
    'You have unsaved changes. Are you sure you want to leave this page?'
  );
  
  // Call onNavigationCancelled if user cancelled and method exists
  if (!confirmed && component.onNavigationCancelled) {
    component.onNavigationCancelled();
  }
  
  return confirmed;
};



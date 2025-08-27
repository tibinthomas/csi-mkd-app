/**
 * Feature flags configuration for build-time toggles
 */
export interface FeatureFlags {
  enableVoiceInput: boolean;
}

/**
 * Get the current feature flags based on configuration
 */
export function getFeatureFlags(): FeatureFlags {
  return {
    enableVoiceInput: false,
  };
}

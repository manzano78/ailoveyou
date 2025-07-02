const ORDERED_PROFILE_CAPTURE_STEPS = [
  'base-info',
  'onboarding',
  'ai-conversation',
] as const;

export function getNextProfileCaptureStep(
  currentProfileCaptureStep: ProfileCaptureStep,
): ProfileCaptureStep | null {
  const indexOfCurrentProfileCaptureStep =
    ORDERED_PROFILE_CAPTURE_STEPS.indexOf(currentProfileCaptureStep);

  return indexOfCurrentProfileCaptureStep ===
    ORDERED_PROFILE_CAPTURE_STEPS.length - 1
    ? null
    : ORDERED_PROFILE_CAPTURE_STEPS[indexOfCurrentProfileCaptureStep + 1];
}

export type ProfileCaptureStep = (typeof ORDERED_PROFILE_CAPTURE_STEPS)[number];

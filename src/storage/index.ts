export type { Entry, LoadResult } from "./storage";
export {
  acceptAgreement,
  checkAgreement,
  checkOnboardingComplete,
  DEFAULT_DELIVERED_TTL_DAYS,
  DELIVERED_TTL_OPTIONS,
  getOrCreateDeviceId,
  isValidEntry,
  loadDeliveredTTL,
  loadEntries,
  resetAgreement,
  resetOnboarding,
  saveDeliveredTTL,
  saveEntries,
  setOnboardingComplete,
} from "./storage";

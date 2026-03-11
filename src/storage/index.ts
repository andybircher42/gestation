export type { Entry, LoadResult, Patient, PatientLoadResult } from "./storage";
export {
  acceptAgreement,
  checkAgreement,
  checkOnboardingComplete,
  getOrCreateDeviceId,
  isValidEntry,
  isValidPatient,
  loadEntries,
  loadPatients,
  resetAgreement,
  saveEntries,
  savePatients,
  setOnboardingComplete,
} from "./storage";

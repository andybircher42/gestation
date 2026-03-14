# ADR 001: Local-Only Storage, No Cloud Sync

## Status

Accepted

## Context

The app tracks gestational ages for people in a clinical setting. This involves names and due dates — information that falls under HIPAA's definition of protected health information (PHI) when combined with clinical context.

Building a server backend would require HIPAA-compliant infrastructure (BAA with cloud provider, encryption at rest and in transit, access logging, breach notification procedures). This is a significant cost and compliance burden for a utility app.

## Decision

All data stays on-device via AsyncStorage. Nothing is sent to a server or backed up to the cloud.

## Consequences

- **Privacy**: No PHI leaves the device. The HIPAA risk surface is limited to physical device access.
- **Simplicity**: No backend to build, deploy, or maintain. No authentication system needed.
- **Trade-off**: No cross-device sync. If a user loses their phone, data is gone. This is acceptable because the data is transient (gestational tracking is time-bounded) and the app explicitly encourages using first names or nicknames only.
- **Trade-off**: No shared access. Multiple users can't share a list. This could be addressed later with local export/import if needed.

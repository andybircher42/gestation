#!/usr/bin/env sh

# Pre-commit check: warn when files that affect native builds change
# without a version bump in app.json.
#
# Native-impacting files: package.json deps, app.json plugins/config,
# native dirs, eas.json build profiles.

# Only check staged changes
STAGED=$(git diff --cached --name-only 2>/dev/null)

if [ -z "$STAGED" ]; then
  exit 0
fi

# Files that indicate a native change
NATIVE_PATTERNS="package.json
app.json
eas.json
ios/
android/
app.config.ts
app.config.js"

NATIVE_CHANGED=false
VERSION_BUMPED=false

for pattern in $NATIVE_PATTERNS; do
  if echo "$STAGED" | grep -q "^${pattern}"; then
    NATIVE_CHANGED=true
    break
  fi
done

if [ "$NATIVE_CHANGED" = false ]; then
  exit 0
fi

# Check if app.json version was changed in this commit
if echo "$STAGED" | grep -q "^app.json"; then
  VERSION_DIFF=$(git diff --cached app.json | grep -E '^\+.*"version"' || true)
  RUNTIME_DIFF=$(git diff --cached app.json | grep -E '^\+.*"runtimeVersion"' || true)
  if [ -n "$VERSION_DIFF" ] || [ -n "$RUNTIME_DIFF" ]; then
    VERSION_BUMPED=true
  fi
fi

if [ "$VERSION_BUMPED" = false ]; then
  echo ""
  echo "⚠  Native-impacting files changed without a version bump:"
  echo ""
  for pattern in $NATIVE_PATTERNS; do
    echo "$STAGED" | grep "^${pattern}" | while read -r f; do echo "   - $f"; done
  done
  echo ""
  echo "   Consider bumping \"version\" and \"runtimeVersion\" in app.json"
  echo "   so the next eas build targets a new runtime version."
  echo ""
  echo "   Press Ctrl+C to abort, or wait 5s to continue..."
  sleep 5
fi

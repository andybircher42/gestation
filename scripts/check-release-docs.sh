#!/usr/bin/env sh

# Pre-commit check: warn when app.json version is bumped without
# updating CHANGELOG.md or docs/user-guide.md.

STAGED=$(git diff --cached --name-only 2>/dev/null)

if [ -z "$STAGED" ]; then
  exit 0
fi

# Check if app.json version was bumped in this commit
if ! echo "$STAGED" | grep -q "^app.json"; then
  exit 0
fi

VERSION_DIFF=$(git diff --cached app.json | grep -E '^\+.*"version"' || true)
if [ -z "$VERSION_DIFF" ]; then
  exit 0
fi

# Version was bumped — check that docs were updated too
MISSING=""

if ! echo "$STAGED" | grep -q "^CHANGELOG.md"; then
  MISSING="$MISSING\n   - CHANGELOG.md"
fi

if ! echo "$STAGED" | grep -q "^docs/user-guide.md"; then
  MISSING="$MISSING\n   - docs/user-guide.md"
fi

if [ -z "$MISSING" ]; then
  exit 0
fi

echo ""
echo "⚠  Version bump detected but release docs not updated:"
echo ""
printf "%b\n" "$MISSING"
echo ""
echo "   Update these files to document what changed in this release."
echo ""
echo "   Press Ctrl+C to abort, or wait 5s to continue..."
sleep 5

#!/usr/bin/env bash
# Flowclass onboarding automation with agent-browser
set -e

TIMESTAMP=$(date +%s)
EMAIL="testflow${TIMESTAMP}@example.com"
PHONE="91234567"
NAME="Test User"
PASSWORD="TestPass123!@#"

ab() { npx --yes agent-browser "$@"; }

echo "==> Opening register page..."
ab open http://localhost:3000/register

echo "==> Step 1: Fill email and continue..."
ab find placeholder "example@gmail.com" fill "$EMAIL"
ab find role button click --name "Continue"
sleep 4

echo "==> Step 2: Phone step..."
ab snapshot -i
ab fill @e4 "$PHONE"
ab click @e5
sleep 4

echo "==> Step 3: Name step..."
ab snapshot -i
ab fill @e4 "$NAME"
ab click @e5
sleep 4

echo "==> Step 4: Password step..."
ab snapshot -i
# e4=password, e6=confirm password, e8=consent checkbox, e11=Register
ab fill @e4 "$PASSWORD"
ab fill @e6 "$PASSWORD"
ab check @e8
ab click @e11
sleep 6

echo "==> Current URL:"
ab get url
echo "==> Setup page snapshot:"
ab snapshot -i

# --- Setup flow ---
echo "==> Step 5: Welcome - click 'Yes, set up now' card"
ab find text "Yes, set up now" click 2>/dev/null || ab find role button click --name "Launch your site"
sleep 4

echo "==> Step 6: Domain - fill school name and site domain"
ab snapshot -i
SCHOOL="Test School $TIMESTAMP"
DOMAIN="testschool${TIMESTAMP}.flowclass.io"
ab find placeholder "My School" fill "$SCHOOL" 2>/dev/null || ab fill @e4 "$SCHOOL"
ab find placeholder "example.com" fill "$DOMAIN" 2>/dev/null || ab fill @e6 "$DOMAIN"
sleep 2
ab find role button click --name "Next" 2>/dev/null || ab find text "Next" click
sleep 6

echo "==> Step 7: Country - confirm and next"
ab snapshot -i
# Country step may show confirmation dialog
ab find role button click --name "Confirm" 2>/dev/null || true
ab find role button click --name "Next" 2>/dev/null || ab find text "Next" click
sleep 4

echo "==> Step 8: Class setup - try to skip or minimal fill"
ab snapshot -i
# Class setup can proceed with just Next if no validation
ab find role button click --name "Next" 2>/dev/null || ab find text "Next" click
sleep 4

echo "==> Step 9: Payment - skip"
ab snapshot -i
ab find text "Skip" click 2>/dev/null || ab find role button click --name "Next"
sleep 4

echo "==> Step 10: WhatsApp - skip"
ab snapshot -i
ab find role button click --name "Next"
sleep 4

echo "==> Step 11: Student enrollment"
ab snapshot -i
# MobilePreviewStep may need to reach upload-receipt in iframe - try Next
ab find role button click --name "Next" 2>/dev/null || true
sleep 4

echo "==> Step 12: Success - Visit Dashboard"
ab snapshot -i
ab find text "Visit Dashboard" click 2>/dev/null || ab find role button click --name "Visit Dashboard"
sleep 4

echo "==> Final URL:"
ab get url
echo "==> Navigate to /dashboard if needed"
ab open http://localhost:3000/dashboard 2>/dev/null || true
ab get url

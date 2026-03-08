# OSS Secret Safety Checklist

Before publishing this repository:

1. Ensure all `.env.local`, `.env.production`, and private env files are ignored.
2. Rotate and replace any previously exposed credentials (Stripe, AWS, Firebase, SMTP, Twilio, Xero).
3. Keep only placeholder values in `apps/*/.env.example`.
4. Remove private key material and service account files from tracked history.
5. Confirm no API token is hardcoded in source.
6. Run:

```bash
rg "SECRET|API_KEY|PRIVATE_KEY|TOKEN|PASSWORD" apps
```

Then manually review matches for false positives.

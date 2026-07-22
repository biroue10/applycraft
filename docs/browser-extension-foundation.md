# ApplyCraft browser extension foundation

Status: roadmap only. No extension is currently available.

## User-controlled workflow

The future extension may detect a supported job page, but it must capture the company, role, URL or job description only after an explicit user action. It then opens the public ApplyCraft Application Pack with a short-lived handoff and asks the user to confirm the data before creating a tracker record.

## Data contract

```json
{
  "schemaVersion": 1,
  "companyName": "string",
  "jobTitle": "string",
  "jobUrl": "https URL",
  "jobDescription": "optional string",
  "capturedAt": "ISO-8601 timestamp",
  "sourceOrigin": "https origin"
}
```

The receiver rejects dangerous URL protocols, unknown keys, oversized values and stale handoffs. It never accepts document content, authentication tokens or page cookies.

## Permissions and privacy

- Prefer `activeTab` and a user click over broad host permissions.
- Request access only for the tab being captured.
- Never read form fields, messages, account pages or unrelated browsing history.
- Keep tracking off by default and provide no claim about recruiter identity.
- Do not log job descriptions or candidate data.
- Show exactly what will be transferred before opening ApplyCraft.

## Integration points

The contract maps to `createApplicationRecord` in `src/application/applicationRecord.js`, then to Master Profile, resume, cover-letter, ATS, tracker and interview-prep routes. Shipping requires a separate threat model, store review, localized consent UI and end-to-end tests. Until then, the feature remains a documented roadmap item only.

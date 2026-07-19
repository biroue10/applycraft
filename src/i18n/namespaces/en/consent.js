// Cookie-banner strings. Deliberately NOT registered in src/i18n/index.js:
// the banner is the generated vanilla public/consent.js, so shipping these
// in the React i18n chunk would be dead weight against the JS budget.
// Consumed by scripts/generate-consent-asset.mjs.
const consent = {
  "title": "Cookies on ApplyCraft",
  "body": "We use Google Analytics to understand how the site is used. It sets cookies and sends usage data, your device type, and an approximate location derived from your IP address to Google. Nothing you write in the builder is ever sent. Analytics stays off unless you accept.",
  "accept": "Accept analytics",
  "reject": "Reject",
  "privacyLink": "Read our Privacy Policy",
  "regionLabel": "Cookie consent",
  "preferences": "Cookie preferences",
  "acceptedNotice": "Analytics cookies are on.",
  "rejectedNotice": "Analytics cookies are off.",
  "change": "Change",
};

export default consent;

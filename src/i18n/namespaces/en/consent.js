// Cookie-banner strings. Deliberately NOT registered in src/i18n/index.js:
// the banner is the generated vanilla public/consent.js, so shipping these
// in the React i18n chunk would be dead weight against the JS budget.
// Consumed by scripts/generate-consent-asset.mjs.
const consent = {
  "title": "Cookie preferences",
  "body": "We use essential cookies to keep ApplyCraft working, optional analytics cookies to improve the product, and optional marketing cookies for affiliate measurement. You can accept, reject, or manage your preferences.",
  "accept": "Accept all",
  "reject": "Reject optional",
  "manage": "Manage preferences",
  "save": "Save preferences",
  "essential": "Essential cookies",
  "analytics": "Analytics cookies",
  "marketing": "Marketing and affiliate measurement cookies",
  "alwaysOn": "Always on",
  "privacyLink": "Privacy Policy",
  "cookiePolicyLink": "Cookie Policy",
  "regionLabel": "Cookie consent",
  "preferences": "Cookie preferences",
  "acceptedNotice": "Analytics cookies are on.",
  "rejectedNotice": "Analytics cookies are off.",
  "change": "Change",
};

export default consent;

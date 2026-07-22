export const DATA_ACTIVITIES = Object.freeze({
  editor: { location: "browser-memory", transmission: "none", trigger: "editing", retention: "current-session" },
  localTracker: { location: "this-device", transmission: "none", trigger: "explicit-save", retention: "until-user-deletes" },
  export: { location: "this-device", transmission: "none", trigger: "explicit-export", retention: "user-controlled" },
  ai: { location: "ai-provider", transmission: "selected-content", trigger: "explicit-ai-action", retention: "provider-policy" },
  privateShare: { location: "encrypted-link-fragment", transmission: "recipient-request", trigger: "explicit-share", retention: "user-controlled" },
});

export function activityDisclosure(activity) {
  if (!Object.prototype.hasOwnProperty.call(DATA_ACTIVITIES, activity)) throw new Error("Unknown data activity");
  return DATA_ACTIVITIES[activity];
}

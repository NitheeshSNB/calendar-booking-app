// Google OAuth configuration
export const googleOAuthConfig = {
  clientId: "your_google_client_id.apps.googleusercontent.com",
  clientSecret: "your_google_client_secret", // In production, this should be server-side only
  redirectUri: window.location.origin + "/auth/callback",
  scopes: [
    "openid",
    "email",
    "profile",
    "https://www.googleapis.com/auth/calendar.events",
    "https://www.googleapis.com/auth/calendar.readonly"
  ].join(" ")
};

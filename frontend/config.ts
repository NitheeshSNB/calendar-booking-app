// Google OAuth configuration
export const googleOAuthConfig = {
  // TODO: Replace with your actual Google OAuth client ID from Google Cloud Console
  // Get this from: https://console.cloud.google.com/apis/credentials
  clientId: "",
  
  // Note: Client secret should be stored server-side as a secret, not in frontend
  redirectUri: window.location.origin + "/auth/callback",
  
  scopes: [
    "openid",
    "email", 
    "profile",
    "https://www.googleapis.com/auth/calendar.events",
    "https://www.googleapis.com/auth/calendar.readonly"
  ].join(" ")
};

// Helper to check if OAuth is properly configured
export const isOAuthConfigured = () => {
  return googleOAuthConfig.clientId && googleOAuthConfig.clientId.includes('.apps.googleusercontent.com');
};

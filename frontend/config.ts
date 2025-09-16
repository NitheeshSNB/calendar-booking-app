// Google OAuth configuration
export const googleOAuthConfig = {
  // TODO: Replace with your actual Google OAuth client ID from Google Cloud Console
  // Get this from: https://console.cloud.google.com/apis/credentials
  clientId: process.env.GOOGLE_CLIENT_ID || "775355110412-aeb994a58vgjojivdan6g8rglvn2c0mm.apps.googleusercontent.com",
  
  // Note: Client secret should be stored server-side as a secret, not in frontend
  redirectUri: (typeof window !== 'undefined' ? window.location.origin : process.env.VERCEL_URL || 'http://localhost:3000') + "/auth/callback",
  
  scopes: [
    "openid",
    "email", 
    "profile",
    "https://www.googleapis.com/auth/calendar.events",
    "https://www.googleapis.com/auth/calendar.readonly"
  ].join(" ")
};

// API configuration
export const apiConfig = {
  baseUrl: process.env.VITE_API_URL || (typeof window !== 'undefined' && window.location.origin + '/api') || 'http://localhost:4000'
};

// Helper to check if OAuth is properly configured
export const isOAuthConfigured = () => {
  return googleOAuthConfig.clientId && googleOAuthConfig.clientId.includes('.apps.googleusercontent.com');
};

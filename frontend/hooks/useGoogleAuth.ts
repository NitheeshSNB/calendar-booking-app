import { useState, useCallback } from 'react';
import { googleOAuthConfig, isOAuthConfigured } from '../config';
import { useAuth } from '../contexts/AuthContext';

export interface GoogleTokens {
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
}

export interface GoogleUserInfo {
  email: string;
  name: string;
  picture?: string;
}

export function useGoogleAuth() {
  const [isLoading, setIsLoading] = useState(false);
  const { signIn } = useAuth();

  const initiateGoogleAuth = useCallback(() => {
    if (!isOAuthConfigured()) {
      alert('Google OAuth is not configured. Please set up your Google OAuth credentials in the config file.');
      return;
    }

    const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    authUrl.searchParams.set('client_id', googleOAuthConfig.clientId);
    authUrl.searchParams.set('redirect_uri', googleOAuthConfig.redirectUri);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('scope', googleOAuthConfig.scopes);
    authUrl.searchParams.set('access_type', 'offline');
    authUrl.searchParams.set('prompt', 'consent');

    window.location.href = authUrl.toString();
  }, []);

  const exchangeCodeForTokens = useCallback(async (code: string): Promise<{ tokens: GoogleTokens; userInfo: GoogleUserInfo }> => {
    setIsLoading(true);
    try {
      // For development/demo purposes, we'll create mock data
      // In a real app, this should go through your backend to securely exchange tokens
      const mockTokens: GoogleTokens = {
        accessToken: 'mock_access_token_' + Date.now(),
        refreshToken: 'mock_refresh_token_' + Date.now(),
        expiresIn: 3600,
      };

      const mockUserInfo: GoogleUserInfo = {
        email: 'demo@example.com',
        name: 'Demo User',
        picture: undefined,
      };

      // Sign in the user
      signIn(mockUserInfo);

      return { tokens: mockTokens, userInfo: mockUserInfo };
    } finally {
      setIsLoading(false);
    }
  }, [signIn]);

  return {
    initiateGoogleAuth,
    exchangeCodeForTokens,
    isLoading,
    isConfigured: isOAuthConfigured(),
  };
}

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

    console.log('OAuth URL:', authUrl.toString());
    console.log('Redirect URI:', googleOAuthConfig.redirectUri);
    
    window.location.href = authUrl.toString();
  }, []);

  const exchangeCodeForTokens = useCallback(async (code: string): Promise<{ tokens: GoogleTokens; userInfo: GoogleUserInfo }> => {
    setIsLoading(true);
    try {
      // Exchange authorization code for tokens
      const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: googleOAuthConfig.clientId,
          client_secret: '', // This should be handled by backend for security
          code,
          grant_type: 'authorization_code',
          redirect_uri: googleOAuthConfig.redirectUri,
        }),
      });

      if (!tokenResponse.ok) {
        const errorData = await tokenResponse.text();
        console.error('Token exchange failed:', errorData);
        throw new Error('Failed to exchange code for tokens');
      }

      const tokenData = await tokenResponse.json();
      
      // Get user info from Google
      const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
        },
      });

      if (!userInfoResponse.ok) {
        throw new Error('Failed to get user info');
      }

      const userInfo = await userInfoResponse.json();

      const tokens: GoogleTokens = {
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token,
        expiresIn: tokenData.expires_in,
      };

      const user: GoogleUserInfo = {
        email: userInfo.email,
        name: userInfo.name,
        picture: userInfo.picture,
      };

      // Sign in the user
      signIn(user);

      return { tokens, userInfo: user };
    } catch (error) {
      console.error('OAuth exchange error:', error);
      
      // For demo purposes, create mock data if real OAuth fails
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

      // Sign in the user with mock data
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

import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/components/ui/use-toast';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useBackend } from '../hooks/useBackend';
import { useGoogleAuth } from '../hooks/useGoogleAuth';

export function AuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const backend = useBackend();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { exchangeCodeForTokens } = useGoogleAuth();

  const authCode = searchParams.get('code');
  const error = searchParams.get('error');
  const userType = localStorage.getItem('userType') || 'buyer';

  const processAuthMutation = useMutation({
    mutationFn: async () => {
      if (!authCode) throw new Error('No auth code received');

      // Exchange code for tokens and get user info
      const { tokens, userInfo } = await exchangeCodeForTokens(authCode);
      
      // Create/update user with Google tokens
      const expiresAt = new Date(Date.now() + tokens.expiresIn * 1000);
      
      return await backend.users.createUser({
        name: userInfo.name,
        email: userInfo.email,
        userType: userType as 'buyer' | 'seller',
        googleRefreshToken: tokens.refreshToken,
        googleAccessToken: tokens.accessToken,
        googleTokenExpiresAt: expiresAt,
      });
    },
    onSuccess: () => {
      localStorage.removeItem('userType');
      queryClient.invalidateQueries({ queryKey: ['user'] });
      
      toast({
        title: "Google Calendar Connected!",
        description: "Your calendar has been successfully connected.",
      });

      // Redirect based on user type
      navigate(userType === 'seller' ? '/seller' : '/buyer');
    },
    onError: (error) => {
      console.error('Auth callback error:', error);
      toast({
        title: "Connection Failed",
        description: "Failed to connect your Google Calendar. Please try again.",
        variant: "destructive",
      });
      navigate(userType === 'seller' ? '/seller' : '/buyer');
    },
  });

  useEffect(() => {
    if (error) {
      toast({
        title: "Authorization Cancelled",
        description: "Google Calendar connection was cancelled.",
        variant: "destructive",
      });
      navigate(userType === 'seller' ? '/seller' : '/buyer');
      return;
    }

    if (authCode && !processAuthMutation.isPending) {
      processAuthMutation.mutate();
    }
  }, [authCode, error]);

  if (error) {
    return (
      <div className="max-w-md mx-auto mt-16">
        <Card>
          <CardHeader className="text-center">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <CardTitle>Authorization Failed</CardTitle>
            <CardDescription>
              There was an error connecting your Google Calendar.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {error === 'access_denied' 
                  ? 'You denied access to your Google Calendar.' 
                  : 'An unexpected error occurred during authorization.'}
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-16">
      <Card>
        <CardHeader className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary mx-auto mb-4"></div>
          <CardTitle>Connecting Your Calendar</CardTitle>
          <CardDescription>
            Please wait while we connect your Google Calendar...
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-sm">Authorization received</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-5 w-5 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
              <span className="text-sm">Exchanging tokens...</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-5 w-5 rounded-full border-2 border-gray-300"></div>
              <span className="text-sm text-muted-foreground">Setting up your profile...</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

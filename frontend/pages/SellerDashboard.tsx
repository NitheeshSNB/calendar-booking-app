import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { Calendar, AlertCircle, CheckCircle, Settings } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useBackend } from '../hooks/useBackend';
import { useGoogleAuth } from '../hooks/useGoogleAuth';
import type { User } from '~backend/users/types';

export function SellerDashboard() {
  const { user } = useAuth();
  const backend = useBackend();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { initiateGoogleAuth } = useGoogleAuth();
  const [isConnecting, setIsConnecting] = useState(false);

  // Get current user data
  const { data: currentUser, isLoading: userLoading } = useQuery({
    queryKey: ['user', user?.email],
    queryFn: async () => {
      if (!user?.email) return null;
      try {
        return await backend.users.getUser({ email: user.email });
      } catch (error) {
        return null;
      }
    },
    enabled: !!user?.email,
  });

  // Create/update user mutation
  const createUserMutation = useMutation({
    mutationFn: async (userData: any) => {
      return await backend.users.createUser(userData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
      toast({
        title: "Success",
        description: "Your seller profile has been updated.",
      });
    },
    onError: (error) => {
      console.error('Failed to create user:', error);
      toast({
        title: "Error",
        description: "Failed to update your profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSignIn = () => {
    localStorage.setItem('userType', 'seller');
    initiateGoogleAuth();
  };

  const handleConnectCalendar = () => {
    setIsConnecting(true);
    localStorage.setItem('userType', 'seller');
    initiateGoogleAuth();
  };

  const handleBecomeSellerWithoutCalendar = () => {
    if (!user) return;

    createUserMutation.mutate({
      name: user.name,
      email: user.email,
      userType: 'seller',
    });
  };

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Sign in to Become a Seller</CardTitle>
            <CardDescription>
              Connect with your Google account to start accepting appointments.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button size="lg" onClick={handleSignIn}>
              <Calendar className="h-5 w-5 mr-2" />
              Sign in with Google
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isCalendarConnected = currentUser?.googleRefreshToken;
  const isSeller = currentUser?.userType === 'seller';

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          Seller Dashboard
        </h1>
        <p className="text-muted-foreground">
          Manage your availability and accept appointments from buyers.
        </p>
      </div>

      {userLoading ? (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading your profile...</p>
          </CardContent>
        </Card>
      ) : !isSeller ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Setup Your Seller Profile
            </CardTitle>
            <CardDescription>
              To start accepting appointments, you need to set up your seller profile.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={handleConnectCalendar}
              disabled={isConnecting || createUserMutation.isPending}
              size="lg"
              className="w-full"
            >
              <Calendar className="h-5 w-5 mr-2" />
              Connect Google Calendar & Become a Seller
            </Button>
            
            <div className="text-center">
              <span className="text-sm text-muted-foreground">or</span>
            </div>
            
            <Button 
              variant="outline"
              onClick={handleBecomeSellerWithoutCalendar}
              disabled={isConnecting || createUserMutation.isPending}
              size="lg"
              className="w-full"
            >
              Become a Seller (Connect Calendar Later)
            </Button>
            
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Connecting your Google Calendar allows buyers to see your real-time availability and book appointments automatically.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Status Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Profile Status</span>
                <Badge variant={isCalendarConnected ? "default" : "secondary"}>
                  {isCalendarConnected ? "Active" : "Setup Required"}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className={`h-5 w-5 ${isSeller ? 'text-green-600' : 'text-gray-400'}`} />
                  <span>Seller Profile Created</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className={`h-5 w-5 ${isCalendarConnected ? 'text-green-600' : 'text-gray-400'}`} />
                  <span>Google Calendar Connected</span>
                </div>
              </div>
              
              {!isCalendarConnected && (
                <div className="mt-6">
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      You need to connect your Google Calendar to accept appointments.
                    </AlertDescription>
                  </Alert>
                  <Button 
                    onClick={handleConnectCalendar}
                    disabled={isConnecting}
                    className="mt-4"
                  >
                    <Calendar className="h-5 w-5 mr-2" />
                    Connect Google Calendar
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Profile Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isCalendarConnected ? 'Active' : 'Pending'}
                </div>
                <p className="text-xs text-muted-foreground">
                  {isCalendarConnected ? 'Ready to accept bookings' : 'Setup required'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Calendar Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isCalendarConnected ? 'Connected' : 'Not Connected'}
                </div>
                <p className="text-xs text-muted-foreground">
                  Google Calendar integration
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Availability</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isCalendarConnected ? 'Auto-Sync' : 'Manual'}
                </div>
                <p className="text-xs text-muted-foreground">
                  Booking availability mode
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Instructions */}
          <Card>
            <CardHeader>
              <CardTitle>How It Works</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">1</div>
                  <div>
                    <strong>Your calendar is synced:</strong> We automatically check your Google Calendar for busy times.
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">2</div>
                  <div>
                    <strong>Buyers see your availability:</strong> Open slots are shown to potential clients (9 AM - 5 PM).
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold">3</div>
                  <div>
                    <strong>Automatic booking:</strong> When someone books, the appointment is added to both calendars with a Google Meet link.
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

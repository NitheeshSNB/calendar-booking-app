import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Calendar, Search, Clock, AlertTriangle, ExternalLink } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useGoogleAuth } from '../hooks/useGoogleAuth';

export function BuyerDashboard() {
  const { user } = useAuth();
  const { initiateGoogleAuth, isConfigured } = useGoogleAuth();

  const handleSignIn = () => {
    localStorage.setItem('userType', 'buyer');
    initiateGoogleAuth();
  };

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto">
        {!isConfigured && (
          <Alert className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Configuration Required:</strong> To enable Google authentication, you need to:
              <ol className="list-decimal list-inside mt-2 space-y-1">
                <li>Go to <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer" className="underline inline-flex items-center gap-1">Google Cloud Console <ExternalLink className="h-3 w-3" /></a></li>
                <li>Select your OAuth 2.0 Client ID</li>
                <li>Add <code className="bg-gray-100 px-1 rounded">{window.location.origin}/auth/callback</code> to "Authorized redirect URIs"</li>
                <li>For development, also add <code className="bg-gray-100 px-1 rounded">http://localhost:3000/auth/callback</code></li>
                <li>Save the changes and wait a few minutes for propagation</li>
              </ol>
              <p className="mt-2 text-sm">Current redirect URI: <code className="bg-gray-100 px-1 rounded">{window.location.origin}/auth/callback</code></p>
            </AlertDescription>
          </Alert>
        )}
        
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Sign in to Book Appointments</CardTitle>
            <CardDescription>
              {isConfigured 
                ? "Connect with your Google account to start booking appointments with sellers."
                : "Demo mode - Click to simulate signing in with Google."
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <Button size="lg" onClick={handleSignIn}>
              <Calendar className="h-5 w-5 mr-2" />
              {isConfigured ? "Sign in with Google" : "Demo Sign in"}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          Welcome back, {user.name.split(' ')[0] || 'Buyer'}!
        </h1>
        <p className="text-muted-foreground">
          Find and book appointments with available sellers.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <Link to="/book">
            <CardHeader>
              <Search className="h-10 w-10 text-blue-600 mb-2" />
              <CardTitle>Browse Sellers</CardTitle>
              <CardDescription>
                Discover available sellers and view their open time slots.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full">
                Browse Available Sellers
              </Button>
            </CardContent>
          </Link>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <Link to="/appointments">
            <CardHeader>
              <Clock className="h-10 w-10 text-green-600 mb-2" />
              <CardTitle>My Appointments</CardTitle>
              <CardDescription>
                View and manage your upcoming and past appointments.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full">
                View My Appointments
              </Button>
            </CardContent>
          </Link>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Make sure to sign in with the same Google account you want to receive calendar invites on</li>
            <li>• All appointments will be automatically added to your Google Calendar</li>
            <li>• You'll receive a Google Meet link for virtual meetings</li>
            <li>• You can view all your appointments in the "My Appointments" section</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Search, Clock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useGoogleAuth } from '../hooks/useGoogleAuth';

export function BuyerDashboard() {
  const { user } = useAuth();
  const { initiateGoogleAuth } = useGoogleAuth();

  const handleSignIn = () => {
    localStorage.setItem('userType', 'buyer');
    initiateGoogleAuth();
  };

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Sign in to Book Appointments</CardTitle>
            <CardDescription>
              Connect with your Google account to start booking appointments with sellers.
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

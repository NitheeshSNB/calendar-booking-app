import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Calendar, Clock, User, Video, ExternalLink, AlertTriangle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useBackend } from '../hooks/useBackend';
import { useGoogleAuth } from '../hooks/useGoogleAuth';
import { format, parseISO, isPast, isFuture } from 'date-fns';
import type { AppointmentWithDetails } from '~backend/users/types';

export function Appointments() {
  const { user } = useAuth();
  const backend = useBackend();
  const { initiateGoogleAuth, isConfigured } = useGoogleAuth();

  // Get user's appointments
  const { data: appointmentsData, isLoading } = useQuery({
    queryKey: ['appointments', user?.email],
    queryFn: async () => {
      if (!user?.email) throw new Error('User email required');
      return backend.appointments.listAppointments({ userEmail: user.email });
    },
    enabled: !!user?.email,
  });

  const handleSignIn = () => {
    localStorage.setItem('userType', 'buyer');
    initiateGoogleAuth();
  };

  const appointments = appointmentsData?.appointments || [];
  const upcomingAppointments = appointments.filter(apt => isFuture(parseISO(apt.startTime.toString())));
  const pastAppointments = appointments.filter(apt => isPast(parseISO(apt.endTime.toString())));

  const AppointmentCard = ({ appointment }: { appointment: AppointmentWithDetails }) => {
    const startTime = parseISO(appointment.startTime.toString());
    const endTime = parseISO(appointment.endTime.toString());
    const isUpcoming = isFuture(startTime);

    return (
      <Card className={`${isUpcoming ? 'border-green-200' : 'border-gray-200'}`}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-lg">{appointment.title}</CardTitle>
              <CardDescription className="flex items-center gap-2 mt-1">
                <Calendar className="h-4 w-4" />
                {format(startTime, 'EEEE, MMMM d, yyyy')}
              </CardDescription>
            </div>
            <Badge variant={isUpcoming ? "default" : "secondary"}>
              {isUpcoming ? "Upcoming" : "Past"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>
              {format(startTime, 'h:mm a')} - {format(endTime, 'h:mm a')}
            </span>
          </div>

          <div className="flex items-center gap-2 text-sm">
            <User className="h-4 w-4 text-muted-foreground" />
            <span>
              {appointment.buyer.name} & {appointment.seller.name}
            </span>
          </div>

          {appointment.description && (
            <p className="text-sm text-muted-foreground">
              {appointment.description}
            </p>
          )}

          {appointment.meetLink && isUpcoming && (
            <div className="flex items-center gap-2 pt-2 border-t">
              <Video className="h-4 w-4 text-blue-600" />
              <a
                href={appointment.meetLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-blue-600 hover:underline flex items-center gap-1"
              >
                Join Google Meet
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          )}
        </CardContent>
      </Card>
    );
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
            <CardTitle className="text-2xl">Sign in to View Appointments</CardTitle>
            <CardDescription>
              {isConfigured
                ? "Connect with your Google account to view your scheduled appointments."
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
        <h1 className="text-3xl font-bold mb-2">My Appointments</h1>
        <p className="text-muted-foreground">
          View and manage your upcoming and past appointments.
        </p>
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading your appointments...</p>
          </CardContent>
        </Card>
      ) : appointments.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Calendar className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No appointments yet</h3>
            <p className="text-muted-foreground mb-4">
              You haven't booked any appointments yet. Start by browsing available sellers.
            </p>
            <Button>
              <Calendar className="h-4 w-4 mr-2" />
              Book Your First Appointment
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {/* Upcoming Appointments */}
          {upcomingAppointments.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Clock className="h-5 w-5 text-green-600" />
                Upcoming Appointments ({upcomingAppointments.length})
              </h2>
              <div className="space-y-4">
                {upcomingAppointments.map((appointment) => (
                  <AppointmentCard key={appointment.id} appointment={appointment} />
                ))}
              </div>
            </div>
          )}

          {/* Past Appointments */}
          {pastAppointments.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-gray-600" />
                Past Appointments ({pastAppointments.length})
              </h2>
              <div className="space-y-4">
                {pastAppointments.map((appointment) => (
                  <AppointmentCard key={appointment.id} appointment={appointment} />
                ))}
              </div>
            </div>
          )}

          {/* Information Alert */}
          <Alert>
            <Calendar className="h-4 w-4" />
            <AlertDescription>
              {isConfigured
                ? "All appointments are automatically synced with your Google Calendar. You can also manage them directly from your calendar app."
                : "In demo mode, appointments are stored locally. Real Google Calendar sync requires OAuth setup."
              }
            </AlertDescription>
          </Alert>
        </div>
      )}
    </div>
  );
}

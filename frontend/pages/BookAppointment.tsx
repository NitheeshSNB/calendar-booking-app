import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/components/ui/use-toast';
import { Calendar, Clock, User, Search, CalendarCheck, AlertTriangle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useBackend } from '../hooks/useBackend';
import { useGoogleAuth } from '../hooks/useGoogleAuth';
import { format, parseISO, addDays } from 'date-fns';
import type { User as UserType } from '~backend/users/types';
import type { TimeSlot } from '~backend/calendar/get_availability';

export function BookAppointment() {
  const { sellerId } = useParams();
  const { user } = useAuth();
  const backend = useBackend();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { initiateGoogleAuth, isConfigured } = useGoogleAuth();

  const [selectedSeller, setSelectedSeller] = useState<string>(sellerId || '');
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  // Get list of sellers
  const { data: sellersData, isLoading: sellersLoading } = useQuery({
    queryKey: ['sellers'],
    queryFn: () => backend.users.listSellers(),
  });

  // Get availability for selected seller and date
  const { data: availabilityData, isLoading: availabilityLoading } = useQuery({
    queryKey: ['availability', selectedSeller, selectedDate],
    queryFn: () => backend.calendar.getAvailability({ sellerId: selectedSeller, date: selectedDate }),
    enabled: !!selectedSeller && !!selectedDate,
  });

  // Get current user data
  const { data: currentUser } = useQuery({
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

  // Create/update user as buyer
  const createUserMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('User not found');
      return await backend.users.createUser({
        name: user.name,
        email: user.email,
        userType: 'buyer',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });

  // Book appointment mutation
  const bookAppointmentMutation = useMutation({
    mutationFn: async () => {
      if (!selectedSeller || !selectedSlot || !title || !user?.email) {
        throw new Error('Missing required fields');
      }

      return await backend.appointments.createAppointment({
        buyerEmail: user.email,
        sellerId: selectedSeller,
        title,
        description,
        startTime: new Date(selectedSlot.start),
        endTime: new Date(selectedSlot.end),
      });
    },
    onSuccess: () => {
      toast({
        title: "Appointment Booked!",
        description: "Your appointment has been confirmed and added to both calendars.",
      });
      setSelectedSlot(null);
      setTitle('');
      setDescription('');
      queryClient.invalidateQueries({ queryKey: ['availability'] });
    },
    onError: (error) => {
      console.error('Failed to book appointment:', error);
      toast({
        title: "Booking Failed",
        description: "Failed to book the appointment. Please try again.",
        variant: "destructive",
      });
    },
  });

  React.useEffect(() => {
    if (user && !currentUser && !createUserMutation.isPending) {
      createUserMutation.mutate();
    }
  }, [user, currentUser]);

  const handleSignIn = () => {
    localStorage.setItem('userType', 'buyer');
    initiateGoogleAuth();
  };

  const handleBooking = () => {
    bookAppointmentMutation.mutate();
  };

  const sellers = sellersData?.sellers || [];
  const availableSlots = availabilityData?.availableSlots || [];
  const selectedSellerInfo = sellers.find(s => s.id === selectedSeller);

  // Generate next 7 days for date selection
  const availableDates = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(new Date(), i);
    return {
      value: format(date, 'yyyy-MM-dd'),
      label: format(date, 'EEE, MMM d'),
    };
  });

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto">
        {!isConfigured && (
          <Alert className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Configuration Required:</strong> To enable Google authentication, you need to:
              <ol className="list-decimal list-inside mt-2 space-y-1">
                <li>Create a Google Cloud Project at <a href="https://console.cloud.google.com" target="_blank" rel="noopener noreferrer" className="underline">console.cloud.google.com</a></li>
                <li>Enable the Google Calendar API</li>
                <li>Create OAuth 2.0 credentials</li>
                <li>Update the clientId in frontend/config.ts</li>
                <li>Set up the same credentials as backend secrets (GoogleClientId, GoogleClientSecret)</li>
              </ol>
              <p className="mt-2 text-sm">For now, you can click the button below to use demo mode.</p>
            </AlertDescription>
          </Alert>
        )}
        
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Sign in to Book Appointments</CardTitle>
            <CardDescription>
              {isConfigured
                ? "Connect with your Google account to book appointments with sellers."
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
        <h1 className="text-3xl font-bold mb-2">Book an Appointment</h1>
        <p className="text-muted-foreground">
          Select a seller, choose an available time slot, and book your appointment.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Selection Panel */}
        <div className="space-y-6">
          {/* Seller Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Select a Seller
              </CardTitle>
            </CardHeader>
            <CardContent>
              {sellersLoading ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="mt-2 text-sm text-muted-foreground">Loading sellers...</p>
                </div>
              ) : sellers.length === 0 ? (
                <Alert>
                  <Search className="h-4 w-4" />
                  <AlertDescription>
                    No sellers available at the moment. Please check back later.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-3">
                  {sellers.map((seller) => (
                    <div
                      key={seller.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedSeller === seller.id
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => setSelectedSeller(seller.id)}
                    >
                      <div className="font-medium">{seller.name}</div>
                      <div className="text-sm text-muted-foreground">{seller.email}</div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Date Selection */}
          {selectedSeller && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Select a Date
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  {availableDates.map((date) => (
                    <Button
                      key={date.value}
                      variant={selectedDate === date.value ? "default" : "outline"}
                      onClick={() => setSelectedDate(date.value)}
                      className="justify-start"
                      size="sm"
                    >
                      {date.label}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Time Slot Selection */}
          {selectedSeller && selectedDate && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Available Time Slots
                </CardTitle>
              </CardHeader>
              <CardContent>
                {availabilityLoading ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-2 text-sm text-muted-foreground">Loading availability...</p>
                  </div>
                ) : availableSlots.length === 0 ? (
                  <Alert>
                    <Clock className="h-4 w-4" />
                    <AlertDescription>
                      No available slots for this date. Please try another date.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {availableSlots.map((slot, index) => (
                      <Button
                        key={index}
                        variant={selectedSlot?.start === slot.start ? "default" : "outline"}
                        onClick={() => setSelectedSlot(slot)}
                        size="sm"
                      >
                        {format(parseISO(slot.start), 'h:mm a')}
                      </Button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Booking Form */}
        <div>
          {selectedSlot && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarCheck className="h-5 w-5" />
                  Appointment Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Booking Summary */}
                <div className="p-4 bg-muted rounded-lg">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Seller:</span>
                      <span className="font-medium">{selectedSellerInfo?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Date:</span>
                      <span className="font-medium">
                        {format(parseISO(selectedSlot.start), 'EEEE, MMMM d, yyyy')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Time:</span>
                      <span className="font-medium">
                        {format(parseISO(selectedSlot.start), 'h:mm a')} - {format(parseISO(selectedSlot.end), 'h:mm a')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Appointment Title *</Label>
                    <Input
                      id="title"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g., Strategy Consultation"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Description (Optional)</Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Add any additional details or agenda items..."
                      rows={3}
                    />
                  </div>

                  <Button
                    onClick={handleBooking}
                    disabled={!title || bookAppointmentMutation.isPending}
                    className="w-full"
                    size="lg"
                  >
                    {bookAppointmentMutation.isPending ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Booking...
                      </>
                    ) : (
                      <>
                        <CalendarCheck className="h-5 w-5 mr-2" />
                        Confirm Booking
                      </>
                    )}
                  </Button>
                </div>

                <Alert>
                  <CalendarCheck className="h-4 w-4" />
                  <AlertDescription>
                    {isConfigured
                      ? "This appointment will be automatically added to both your and the seller's Google Calendar with a Google Meet link."
                      : "In demo mode, appointments are stored but calendar integration is simulated."
                    }
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

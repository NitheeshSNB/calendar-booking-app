import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Users, Clock, CheckCircle } from 'lucide-react';

export function Home() {
  return (
    <div className="max-w-6xl mx-auto">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Simple Calendar Booking
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Connect your Google Calendar and let clients book appointments seamlessly. 
          No more back-and-forth emails or scheduling conflicts.
        </p>
        <div className="flex gap-4 justify-center">
          <Link to="/buyer">
            <Button size="lg" className="px-8">
              <Users className="h-5 w-5 mr-2" />
              Book an Appointment
            </Button>
          </Link>
          <Link to="/seller">
            <Button variant="outline" size="lg" className="px-8">
              <Calendar className="h-5 w-5 mr-2" />
              Become a Seller
            </Button>
          </Link>
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
        <Card>
          <CardHeader>
            <Calendar className="h-10 w-10 text-blue-600 mb-2" />
            <CardTitle>Google Calendar Integration</CardTitle>
            <CardDescription>
              Seamlessly sync with your existing Google Calendar. No duplicate bookings.
            </CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <Clock className="h-10 w-10 text-green-600 mb-2" />
            <CardTitle>Real-time Availability</CardTitle>
            <CardDescription>
              Show your real availability based on your calendar and automatically block busy times.
            </CardDescription>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CheckCircle className="h-10 w-10 text-purple-600 mb-2" />
            <CardTitle>Automatic Confirmation</CardTitle>
            <CardDescription>
              Appointments are automatically added to both calendars with Google Meet links.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      {/* How It Works */}
      <div className="text-center mb-16">
        <h2 className="text-3xl font-bold mb-8">How It Works</h2>
        <div className="grid md:grid-cols-2 gap-12">
          <div>
            <h3 className="text-xl font-semibold mb-4 text-blue-600">For Sellers</h3>
            <div className="space-y-4 text-left">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                <p>Sign in with Google and connect your calendar</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                <p>Your availability is automatically calculated</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                <p>Receive booking confirmations in your calendar</p>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="text-xl font-semibold mb-4 text-green-600">For Buyers</h3>
            <div className="space-y-4 text-left">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                <p>Browse available sellers and their time slots</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                <p>Select your preferred time and book instantly</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
                <p>Get automatic calendar invites with meeting details</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-0">
        <CardContent className="p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-muted-foreground mb-6">
            Join thousands of professionals who trust CalendarBook for their scheduling needs.
          </p>
          <div className="flex gap-4 justify-center">
            <Link to="/seller">
              <Button size="lg">Start Selling Your Time</Button>
            </Link>
            <Link to="/buyer">
              <Button variant="outline" size="lg">Book an Appointment</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

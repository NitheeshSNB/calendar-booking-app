import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Calendar, Users, Clock, LogOut, AlertTriangle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { isOAuthConfigured } from '../config';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const { user, signOut } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen bg-background">
      {!isOAuthConfigured() && (
        <Alert className="rounded-none border-x-0 border-t-0 bg-yellow-50 border-yellow-200">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Setup Required:</strong> Google OAuth is not configured. Please set up your Google OAuth credentials in the config file to enable authentication.
          </AlertDescription>
        </Alert>
      )}
      
      <header className="border-b bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <Calendar className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">CalendarBook</span>
          </Link>
          
          <nav className="flex items-center space-x-6">
            {user ? (
              <>
                <Link
                  to="/buyer"
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    isActive('/buyer') ? 'text-primary' : 'text-muted-foreground'
                  }`}
                >
                  Book Appointments
                </Link>
                <Link
                  to="/seller"
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    isActive('/seller') ? 'text-primary' : 'text-muted-foreground'
                  }`}
                >
                  Seller Dashboard
                </Link>
                <Link
                  to="/appointments"
                  className={`flex items-center space-x-2 text-sm font-medium transition-colors hover:text-primary ${
                    isActive('/appointments') ? 'text-primary' : 'text-muted-foreground'
                  }`}
                >
                  <Clock className="h-4 w-4" />
                  <span>Appointments</span>
                </Link>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.picture} alt={user.name} />
                        <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <div className="flex items-center justify-start gap-2 p-2">
                      <div className="flex flex-col space-y-1 leading-none">
                        <p className="font-medium">{user.name}</p>
                        <p className="w-[200px] truncate text-sm text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </div>
                    <DropdownMenuItem onClick={signOut}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Link to="/buyer">
                  <Button variant="outline" size="sm">
                    Sign in as Buyer
                  </Button>
                </Link>
                <Link to="/seller">
                  <Button size="sm">
                    Sign in as Seller
                  </Button>
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}

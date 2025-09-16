# Calendar Booking Application

A modern calendar booking application built with Encore.ts backend and React frontend, featuring Google Calendar integration.

## Features

- 🗓️ Google Calendar integration
- 👥 Buyer and Seller roles
- ⏰ Real-time availability checking
- 📅 Automatic appointment booking
- 🔗 Google Meet integration
- 📱 Responsive design

## Tech Stack

- **Backend**: Encore.ts, PostgreSQL
- **Frontend**: React, TypeScript, Vite, Tailwind CSS
- **Calendar**: Google Calendar API
- **Authentication**: Google OAuth 2.0
- **Deployment**: Vercel

## Local Development

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Encore CLI (`npm install -g encore`)

### Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up Google OAuth:
   - Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
   - Create a new OAuth 2.0 Client ID
   - Add these redirect URIs:
     - `http://localhost:3000/auth/callback` (development)
     - `https://yourdomain.com/auth/callback` (production)

4. Configure environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your Google OAuth credentials
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

The application will be available at:
- Frontend: http://localhost:3000
- Backend: http://localhost:4000

## Deployment to Vercel

### 1. Prepare Your Repository

Make sure your code is pushed to a Git repository (GitHub, GitLab, or Bitbucket).

### 2. Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "New Project"
3. Import your Git repository
4. Vercel will automatically detect the configuration from `vercel.json`

### 3. Configure Environment Variables

In your Vercel project settings, add these environment variables:

```
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

### 4. Update Google OAuth Settings

After deployment, update your Google OAuth configuration:

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Edit your OAuth 2.0 Client ID
3. Add your Vercel domain to authorized redirect URIs:
   ```
   https://your-project.vercel.app/auth/callback
   ```

### 5. Configure Encore Secrets

Set up your secrets in the Encore dashboard or via CLI:

```bash
encore secret set GoogleClientId
encore secret set GoogleClientSecret
```

## Environment Variables

### Required for Production

- `GOOGLE_CLIENT_ID`: Your Google OAuth client ID
- `GOOGLE_CLIENT_SECRET`: Your Google OAuth client secret

### Optional

- `VERCEL_URL`: Automatically set by Vercel
- `VERCEL_ENV`: Automatically set by Vercel (development/preview/production)

## Project Structure

```
├── backend/                 # Encore.ts backend
│   ├── appointments/        # Appointment management
│   ├── calendar/           # Calendar integration
│   └── users/              # User management
├── frontend/               # React frontend
│   ├── components/         # Reusable components
│   ├── pages/             # Page components
│   └── hooks/             # Custom hooks
├── vercel.json            # Vercel configuration
└── package.json           # Dependencies and scripts
```

## API Endpoints

### Users
- `POST /users` - Create/update user
- `POST /users/get` - Get user by email
- `GET /sellers` - List all sellers

### Calendar
- `GET /calendar/availability/:sellerId` - Get seller availability

### Appointments
- `POST /appointments` - Create appointment
- `POST /appointments/list` - List user appointments

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT License - see LICENSE file for details

import { api, APIError, Query } from "encore.dev/api";
import { usersDB } from "../users/db";
import { GoogleCalendarClient } from "./google_client";

export interface GetAvailabilityRequest {
  sellerId: string;
  date: Query<string>; // YYYY-MM-DD format
}

export interface TimeSlot {
  start: string; // ISO string
  end: string; // ISO string
}

export interface GetAvailabilityResponse {
  availableSlots: TimeSlot[];
}

// Gets available time slots for a seller on a specific date.
export const getAvailability = api<GetAvailabilityRequest, GetAvailabilityResponse>(
  { expose: true, method: "GET", path: "/calendar/availability/:sellerId" },
  async (req) => {
    // Get seller information
    const seller = await usersDB.queryRow`
      SELECT id, email, google_refresh_token as "googleRefreshToken",
             google_access_token as "googleAccessToken",
             google_token_expires_at as "googleTokenExpiresAt"
      FROM users WHERE id = ${req.sellerId} AND user_type = 'seller'
    `;

    if (!seller) {
      throw APIError.notFound("seller not found");
    }

    if (!seller.googleRefreshToken) {
      throw APIError.invalidArgument("seller has not connected Google Calendar");
    }

    // Refresh access token if needed
    let accessToken = seller.googleAccessToken;
    const now = new Date();
    const expiresAt = seller.googleTokenExpiresAt ? new Date(seller.googleTokenExpiresAt) : null;

    if (!accessToken || !expiresAt || expiresAt <= now) {
      const tokenResponse = await GoogleCalendarClient.refreshAccessToken(
        seller.googleRefreshToken
      );
      accessToken = tokenResponse.access_token;

      // Update the token in database
      const newExpiresAt = new Date(now.getTime() + tokenResponse.expires_in * 1000);
      await usersDB.exec`
        UPDATE users 
        SET google_access_token = ${accessToken},
            google_token_expires_at = ${newExpiresAt}
        WHERE id = ${seller.id}
      `;
    }

    // Create Google Calendar client
    const calendarClient = new GoogleCalendarClient(accessToken);

    // Get free/busy data for the requested date
    const date = new Date(req.date);
    const timeMin = new Date(date);
    timeMin.setHours(9, 0, 0, 0); // 9 AM
    const timeMax = new Date(date);
    timeMax.setHours(17, 0, 0, 0); // 5 PM

    const freeBusyData = await calendarClient.getFreeBusy(
      seller.email,
      timeMin.toISOString(),
      timeMax.toISOString()
    );

    // Generate available slots (30-minute slots from 9 AM to 5 PM)
    const availableSlots: TimeSlot[] = [];
    const busyPeriods = freeBusyData.calendars[seller.email]?.busy || [];

    let currentTime = new Date(timeMin);
    while (currentTime < timeMax) {
      const slotEnd = new Date(currentTime.getTime() + 30 * 60 * 1000); // 30 minutes

      // Check if this slot conflicts with any busy period
      const isConflict = busyPeriods.some(busy => {
        const busyStart = new Date(busy.start);
        const busyEnd = new Date(busy.end);
        return currentTime < busyEnd && slotEnd > busyStart;
      });

      if (!isConflict && slotEnd <= timeMax) {
        availableSlots.push({
          start: currentTime.toISOString(),
          end: slotEnd.toISOString(),
        });
      }

      currentTime = new Date(currentTime.getTime() + 30 * 60 * 1000);
    }

    return { availableSlots };
  }
);

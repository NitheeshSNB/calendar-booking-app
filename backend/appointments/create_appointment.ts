import { api, APIError } from "encore.dev/api";
import { usersDB } from "../users/db";
import { AppointmentWithDetails } from "../users/types";
import { GoogleCalendarClient, GoogleCalendarEvent } from "../calendar/google_client";

export interface CreateAppointmentRequest {
  buyerEmail: string;
  sellerId: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
}

// Creates a new appointment and adds it to both calendars.
export const createAppointment = api<CreateAppointmentRequest, AppointmentWithDetails>(
  { expose: true, method: "POST", path: "/appointments" },
  async (req) => {
    if (!req.buyerEmail) {
      throw APIError.invalidArgument("buyer email is required");
    }

    // Get buyer information
    const buyer = await usersDB.queryRow`
      SELECT id, email, name, user_type as "userType",
             google_refresh_token as "googleRefreshToken",
             google_access_token as "googleAccessToken",
             google_token_expires_at as "googleTokenExpiresAt"
      FROM users WHERE email = ${req.buyerEmail} AND user_type = 'buyer'
    `;

    if (!buyer) {
      throw APIError.notFound("buyer not found");
    }

    // Get seller information
    const seller = await usersDB.queryRow`
      SELECT id, email, name, user_type as "userType",
             google_refresh_token as "googleRefreshToken",
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

    // Refresh seller's access token if needed
    let sellerAccessToken = seller.googleAccessToken;
    const now = new Date();
    const sellerExpiresAt = seller.googleTokenExpiresAt ? new Date(seller.googleTokenExpiresAt) : null;

    if (!sellerAccessToken || !sellerExpiresAt || sellerExpiresAt <= now) {
      const tokenResponse = await GoogleCalendarClient.refreshAccessToken(
        seller.googleRefreshToken
      );
      sellerAccessToken = tokenResponse.access_token;

      const newExpiresAt = new Date(now.getTime() + tokenResponse.expires_in * 1000);
      await usersDB.exec`
        UPDATE users 
        SET google_access_token = ${sellerAccessToken},
            google_token_expires_at = ${newExpiresAt}
        WHERE id = ${seller.id}
      `;
    }

    // Create the appointment ID and Google event
    const appointmentId = `appt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const meetingId = `meeting_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const googleEvent: GoogleCalendarEvent = {
      summary: req.title,
      description: req.description || `Meeting between ${buyer.name} and ${seller.name}`,
      start: {
        dateTime: req.startTime.toISOString(),
        timeZone: "America/New_York",
      },
      end: {
        dateTime: req.endTime.toISOString(),
        timeZone: "America/New_York",
      },
      attendees: [
        { email: buyer.email, displayName: buyer.name },
        { email: seller.email, displayName: seller.name },
      ],
      conferenceData: {
        createRequest: {
          requestId: meetingId,
          conferenceSolutionKey: {
            type: "hangoutsMeet",
          },
        },
      },
    };

    // Create event in seller's calendar
    const sellerCalendarClient = new GoogleCalendarClient(sellerAccessToken);
    const createdEvent = await sellerCalendarClient.createEvent("primary", googleEvent);

    // Store appointment in database
    await usersDB.exec`
      INSERT INTO appointments (id, buyer_id, seller_id, title, description, start_time, end_time, google_event_id, meet_link, status, created_at, updated_at)
      VALUES (${appointmentId}, ${buyer.id}, ${seller.id}, ${req.title}, ${req.description || null}, ${req.startTime}, ${req.endTime}, ${createdEvent.id || null}, ${createdEvent.conferenceData?.entryPoints?.[0]?.uri || null}, 'confirmed', ${now}, ${now})
    `;

    // Return the created appointment with details
    const appointment = await usersDB.queryRow<AppointmentWithDetails>`
      SELECT 
        a.id, a.buyer_id as "buyerId", a.seller_id as "sellerId",
        a.title, a.description, a.start_time as "startTime", a.end_time as "endTime",
        a.google_event_id as "googleEventId", a.meet_link as "meetLink",
        a.status, a.created_at as "createdAt", a.updated_at as "updatedAt",
        b.id as "buyer.id", b.name as "buyer.name", b.email as "buyer.email",
        s.id as "seller.id", s.name as "seller.name", s.email as "seller.email"
      FROM appointments a
      JOIN users b ON a.buyer_id = b.id
      JOIN users s ON a.seller_id = s.id
      WHERE a.id = ${appointmentId}
    `;

    if (!appointment) {
      throw APIError.internal("failed to create appointment");
    }

    // Transform the flat result into nested structure
    return {
      id: appointment.id,
      buyerId: appointment.buyerId,
      sellerId: appointment.sellerId,
      title: appointment.title,
      description: appointment.description,
      startTime: appointment.startTime,
      endTime: appointment.endTime,
      googleEventId: appointment.googleEventId,
      meetLink: appointment.meetLink,
      status: appointment.status,
      createdAt: appointment.createdAt,
      updatedAt: appointment.updatedAt,
      buyer: {
        id: (appointment as any)["buyer.id"],
        name: (appointment as any)["buyer.name"],
        email: (appointment as any)["buyer.email"],
      },
      seller: {
        id: (appointment as any)["seller.id"],
        name: (appointment as any)["seller.name"],
        email: (appointment as any)["seller.email"],
      },
    };
  }
);

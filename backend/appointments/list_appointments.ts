import { api } from "encore.dev/api";
import { usersDB } from "../users/db";
import { AppointmentWithDetails } from "../users/types";

export interface ListAppointmentsRequest {
  userEmail: string;
}

export interface ListAppointmentsResponse {
  appointments: AppointmentWithDetails[];
}

// Lists all appointments for a user.
export const listAppointments = api<ListAppointmentsRequest, ListAppointmentsResponse>(
  { expose: true, method: "POST", path: "/appointments/list" },
  async (req) => {
    if (!req.userEmail) {
      throw new Error("user email is required");
    }

    // Get current user
    const currentUser = await usersDB.queryRow`
      SELECT id, user_type FROM users WHERE email = ${req.userEmail}
    `;

    if (!currentUser) {
      throw new Error("user not found");
    }

    const appointments: AppointmentWithDetails[] = [];
    let query;

    if (currentUser.user_type === 'buyer') {
      query = usersDB.query`
        SELECT 
          a.id, a.buyer_id as "buyerId", a.seller_id as "sellerId",
          a.title, a.description, a.start_time as "startTime", a.end_time as "endTime",
          a.google_event_id as "googleEventId", a.meet_link as "meetLink",
          a.status, a.created_at as "createdAt", a.updated_at as "updatedAt",
          b.id as "buyer_id", b.name as "buyer_name", b.email as "buyer_email",
          s.id as "seller_id", s.name as "seller_name", s.email as "seller_email"
        FROM appointments a
        JOIN users b ON a.buyer_id = b.id
        JOIN users s ON a.seller_id = s.id
        WHERE a.buyer_id = ${currentUser.id}
        ORDER BY a.start_time DESC
      `;
    } else {
      query = usersDB.query`
        SELECT 
          a.id, a.buyer_id as "buyerId", a.seller_id as "sellerId",
          a.title, a.description, a.start_time as "startTime", a.end_time as "endTime",
          a.google_event_id as "googleEventId", a.meet_link as "meetLink",
          a.status, a.created_at as "createdAt", a.updated_at as "updatedAt",
          b.id as "buyer_id", b.name as "buyer_name", b.email as "buyer_email",
          s.id as "seller_id", s.name as "seller_name", s.email as "seller_email"
        FROM appointments a
        JOIN users b ON a.buyer_id = b.id
        JOIN users s ON a.seller_id = s.id
        WHERE a.seller_id = ${currentUser.id}
        ORDER BY a.start_time DESC
      `;
    }

    for await (const row of query) {
      appointments.push({
        id: row.id,
        buyerId: row.buyerId,
        sellerId: row.sellerId,
        title: row.title,
        description: row.description,
        startTime: row.startTime,
        endTime: row.endTime,
        googleEventId: row.googleEventId,
        meetLink: row.meetLink,
        status: row.status,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
        buyer: {
          id: row.buyer_id,
          name: row.buyer_name,
          email: row.buyer_email,
        },
        seller: {
          id: row.seller_id,
          name: row.seller_name,
          email: row.seller_email,
        },
      });
    }

    return { appointments };
  }
);

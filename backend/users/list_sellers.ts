import { api } from "encore.dev/api";
import { usersDB } from "./db";
import { User } from "./types";

export interface ListSellersResponse {
  sellers: Pick<User, 'id' | 'name' | 'email'>[];
}

// Lists all sellers available for booking.
export const listSellers = api<void, ListSellersResponse>(
  { expose: true, method: "GET", path: "/sellers" },
  async () => {
    const sellers: Pick<User, 'id' | 'name' | 'email'>[] = [];
    
    const rows = usersDB.query<Pick<User, 'id' | 'name' | 'email'>>`
      SELECT id, name, email
      FROM users 
      WHERE user_type = 'seller' AND google_refresh_token IS NOT NULL
      ORDER BY name
    `;

    for await (const row of rows) {
      sellers.push(row);
    }

    return { sellers };
  }
);

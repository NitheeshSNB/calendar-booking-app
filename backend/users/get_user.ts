import { api, APIError } from "encore.dev/api";
import { usersDB } from "./db";
import { User } from "./types";

export interface GetUserRequest {
  email: string;
}

// Gets a user profile by email.
export const getUser = api<GetUserRequest, User>(
  { expose: true, method: "POST", path: "/users/get" },
  async (req) => {
    if (!req.email) {
      throw APIError.invalidArgument("email is required");
    }

    const user = await usersDB.queryRow<User>`
      SELECT id, email, name, user_type as "userType", 
             google_refresh_token as "googleRefreshToken",
             google_access_token as "googleAccessToken",
             google_token_expires_at as "googleTokenExpiresAt",
             created_at as "createdAt", updated_at as "updatedAt"
      FROM users WHERE email = ${req.email}
    `;

    if (!user) {
      throw APIError.notFound("user not found");
    }

    return user;
  }
);

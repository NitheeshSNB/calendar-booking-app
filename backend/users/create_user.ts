import { api, APIError } from "encore.dev/api";
import { usersDB } from "./db";
import { User, UserType } from "./types";

export interface CreateUserRequest {
  name: string;
  email: string;
  userType: UserType;
  googleRefreshToken?: string;
  googleAccessToken?: string;
  googleTokenExpiresAt?: Date;
}

// Creates or updates a user profile.
export const createUser = api<CreateUserRequest, User>(
  { expose: true, method: "POST", path: "/users" },
  async (req) => {
    if (!req.email) {
      throw APIError.invalidArgument("email is required");
    }

    const now = new Date();
    const id = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Check if user already exists
    const existingUser = await usersDB.queryRow<User>`
      SELECT id, email, name, user_type as "userType", 
             google_refresh_token as "googleRefreshToken",
             google_access_token as "googleAccessToken",
             google_token_expires_at as "googleTokenExpiresAt",
             created_at as "createdAt", updated_at as "updatedAt"
      FROM users WHERE email = ${req.email}
    `;

    if (existingUser) {
      // Update existing user
      await usersDB.exec`
        UPDATE users 
        SET name = ${req.name}, 
            user_type = ${req.userType},
            google_refresh_token = ${req.googleRefreshToken || null},
            google_access_token = ${req.googleAccessToken || null},
            google_token_expires_at = ${req.googleTokenExpiresAt || null},
            updated_at = ${now}
        WHERE email = ${req.email}
      `;

      const updatedUser = await usersDB.queryRow<User>`
        SELECT id, email, name, user_type as "userType", 
               google_refresh_token as "googleRefreshToken",
               google_access_token as "googleAccessToken",
               google_token_expires_at as "googleTokenExpiresAt",
               created_at as "createdAt", updated_at as "updatedAt"
        FROM users WHERE email = ${req.email}
      `;

      return updatedUser!;
    }

    // Create new user
    await usersDB.exec`
      INSERT INTO users (id, email, name, user_type, google_refresh_token, google_access_token, google_token_expires_at, created_at, updated_at)
      VALUES (${id}, ${req.email}, ${req.name}, ${req.userType}, ${req.googleRefreshToken || null}, ${req.googleAccessToken || null}, ${req.googleTokenExpiresAt || null}, ${now}, ${now})
    `;

    const user = await usersDB.queryRow<User>`
      SELECT id, email, name, user_type as "userType", 
             google_refresh_token as "googleRefreshToken",
             google_access_token as "googleAccessToken",
             google_token_expires_at as "googleTokenExpiresAt",
             created_at as "createdAt", updated_at as "updatedAt"
      FROM users WHERE id = ${id}
    `;

    if (!user) {
      throw APIError.internal("failed to create user");
    }

    return user;
  }
);

export type UserType = "buyer" | "seller";

export interface User {
  id: string;
  email: string;
  name: string;
  userType: UserType;
  googleRefreshToken?: string;
  googleAccessToken?: string;
  googleTokenExpiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Appointment {
  id: string;
  buyerId: string;
  sellerId: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  googleEventId?: string;
  meetLink?: string;
  status: "confirmed" | "cancelled";
  createdAt: Date;
  updatedAt: Date;
}

export interface AppointmentWithDetails extends Appointment {
  buyer: Pick<User, 'id' | 'name' | 'email'>;
  seller: Pick<User, 'id' | 'name' | 'email'>;
}

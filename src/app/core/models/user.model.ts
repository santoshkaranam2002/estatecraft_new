export type UserRole = 'customer' | 'admin';

export interface AppUser {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: UserRole;
}

export interface SessionUser {
  id: number;
  name: string;
  email: string;
  role: UserRole;
}

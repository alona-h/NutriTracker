interface AppUser {
  id: number;
  authId: string;  // Supabase auth.uid() UUID
  code: string;
  name?: string;
  createdAt?: string;
}
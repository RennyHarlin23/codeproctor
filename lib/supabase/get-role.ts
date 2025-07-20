import { createClient } from "./client";

type UserRole = "admin" | "staff" | "student" | null;

type Profile = {
  role: UserRole;
  id: string;
  created_at: string;
};

// Server-side function to get role (no router dependency)
export default async function getRole(): Promise<UserRole> {
  const supabase = createClient();

  try {
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session) {
      return null;
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role, id, created_at")
      .eq("id", session.user.id)
      .single();

    if (profileError || !profile) {
      return null;
    }

    return profile.role;
  } catch (error) {
    console.error("Error getting role:", error);
    return null;
  }
}

import { auth } from "../../auth";
import { createClient } from "./server";

export default async function getRole() {
  const session = await auth();

  if (!session?.user?.id) {
    return null;
  }

  const userId = session.user.id;

  try {
    const supabase = await createClient();

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Error fetching user role:", error);
      return null;
    }

    return profile?.role || null;
  } catch (error) {
    console.error("Error in getRole:", error);
    return null;
  }
}

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

type UserRole = "admin" | "staff" | "student" | null;

interface Profile {
  role: UserRole;
  id: string;
  created_at: string;
}

interface AuthGuardState {
  user: User | null;
  profile: Profile | null;
  role: UserRole;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
}

export function useAuthGuard(allowedRoles: UserRole[] = []) {
  const [state, setState] = useState<AuthGuardState>({
    user: null,
    profile: null,
    role: null,
    loading: true,
    error: null,
    isAuthenticated: false,
  });

  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setState((prev) => ({ ...prev, loading: true, error: null }));

        // Check authentication
        const {
          data: { session },
          error: authError,
        } = await supabase.auth.getSession();

        if (authError || !session) {
          setState((prev) => ({
            ...prev,
            loading: false,
            isAuthenticated: false,
          }));
          router.push("/auth/login");
          return;
        }

        // Get user profile and role
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("role, id, created_at")
          .eq("id", session.user.id)
          .single();

        if (profileError || !profile) {
          setState((prev) => ({
            ...prev,
            loading: false,
            error: "Profile not found",
            isAuthenticated: false,
          }));
          router.push("/auth/login");
          return;
        }

        // Check role permissions if specified
        if (allowedRoles.length > 0 && !allowedRoles.includes(profile.role)) {
          setState((prev) => ({
            ...prev,
            loading: false,
            error: "Insufficient permissions",
            isAuthenticated: false,
          }));
          router.push("/unauthorized");
          return;
        }

        setState({
          user: session.user,
          profile,
          role: profile.role,
          loading: false,
          error: null,
          isAuthenticated: true,
        });
      } catch (error) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error.message : "Unknown error",
          isAuthenticated: false,
        }));
      }
    };

    checkAuth();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(checkAuth);

    return () => subscription.unsubscribe();
  }, [allowedRoles, router, supabase]);

  return state;
}

// Simple hook to just get the role without auth guard logic
export function useRole() {
  const [role, setRole] = useState<UserRole>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const getRole = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session) {
          setRole(null);
          setLoading(false);
          return;
        }

        const { data: profile } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", session.user.id)
          .single();

        setRole(profile?.role || null);
      } catch (error) {
        console.error("Error getting role:", error);
        setRole(null);
      } finally {
        setLoading(false);
      }
    };

    getRole();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(getRole);
    return () => subscription.unsubscribe();
  }, [supabase]);

  return { role, loading };
}

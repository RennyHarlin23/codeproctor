"use client";

import { useRouter } from "next/router";
import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

export default function RoleGuard({
  children,
  allowedRoles,
}: {
  children: React.ReactNode;
  allowedRoles: string[];
}) {

    const route = useRouter();

    useEffect(() => {
        const checkUserRole = async () => {
            const {data: {session}} = await supabase.auth.getSession();
            if (!session) {
                route.push("/login");
                return;
            }

            const {data:profile, error} = await supabase
                .from("profiles")
                .select("role")
                .eq("id", session.user.id)
                .single();

            if (error) {
                route.push("/login");
                return;
            }

            if (!allowedRoles.includes(profile.role)) {
                route.push("/unauthorized");
                return;
            }
        }

        checkUserRole();
    }, [allowedRoles, route]);

  return <>{children}</>;
}
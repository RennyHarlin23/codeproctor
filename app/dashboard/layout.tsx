"use client";

import React from "react";
import { useRole } from "@/hooks/use-auth-guard";

export default function DashboardLayout(props: {
  children: React.ReactNode;
  admin: React.ReactNode;
  staff: React.ReactNode;
  student: React.ReactNode;
}) {
  const { role, loading } = useRole();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2">Loading...</p>
        </div>
      </div>
    );
  }

  if (role === "admin") {
    return <>{props.admin}</>;
  }
  if (role === "staff") {
    return <>{props.staff}</>;
  }
  if (role === "student") {
    return <>{props.student}</>;
  }

  return <div>Unauthorized</div>;
}

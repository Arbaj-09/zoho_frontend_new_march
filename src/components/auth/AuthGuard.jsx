"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AuthGuard({ children, allowedRoles = [] }) {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    const role = localStorage.getItem("user_role");

    if (!token) {
      router.replace("/login");
      return;
    }

    if (allowedRoles.length && !allowedRoles.includes(role)) {
      router.replace("/unauthorized");
    }
  }, [router, allowedRoles]);

  return <>{children}</>;
}

"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { getAuthUser } from "@/utils/authUser";

// � HYDRATION-SAFE: Department & Role-based Page Guard
export const useDepartmentGuard = (allowedRoles = [], requireDepartment = false) => {
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const user = getAuthUser();

    // ⏳ Wait until user is loaded (hydration-safe)
    if (!user) return;

    // � ROLE CHECK
    if (allowedRoles.length && !allowedRoles.includes(user.role)) {
      toast.error("You are not authorized to access this page");
      router.replace("/");
      return;
    }

    // 🏢 DEPARTMENT CHECK (ONLY FOR TL / EMPLOYEE)
    if (
      requireDepartment &&
      !user.department &&
      !["ADMIN", "MANAGER"].includes(user.role)
    ) {
      toast.error("Department access required");
      router.replace("/");
      return;
    }

    setChecked(true);
  }, [router, allowedRoles, requireDepartment]);

  return checked;
};

// 🔥 SPECIFIC PAGE GUARDS
export const useAdminGuard = () => useDepartmentGuard(["ADMIN"]);
export const useManagerGuard = () => useDepartmentGuard(["ADMIN", "MANAGER"]);
export const useTLGuard = () => useDepartmentGuard(["ADMIN", "MANAGER", "TL"]);
export const useEmployeeGuard = () => useDepartmentGuard(["ADMIN", "MANAGER", "TL", "EMPLOYEE"]);
export const useDepartmentRequiredGuard = () => useDepartmentGuard([], true);

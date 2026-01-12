"use client";

export const getLoggedInUser = () => {
  if (typeof window === "undefined") return { name: "Admin", role: "Administrator" };
  try {
    const raw = localStorage.getItem("user_data");
    const obj = raw ? JSON.parse(raw) : null;
    const name = obj?.name || obj?.fullName || obj?.username || obj?.email || "Admin";
    const role = obj?.role || obj?.designation || "Administrator";
    return { name, role };
  } catch {
    return { name: "Admin", role: "Administrator" };
  }
};

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function TasksPage() {
    const router = useRouter();

    useEffect(() => {
        // Redirect to overview page
        router.replace("/tasks/overview");
    }, [router]);

    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="text-slate-600">Loading...</div>
        </div>
    );
}
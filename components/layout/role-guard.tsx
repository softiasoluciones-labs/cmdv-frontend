"use client";

import { useAuth } from "@/hooks/auth-hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

interface RoleGuardProps {
    allowed: string[];
    fallback?: React.ReactNode;
    redirectTo?: string;
    children: React.ReactNode;
}

/**
 * Client-side role guard. The middleware is the authoritative gate; this
 * component exists to hide UI sections and avoid rendering sensitive
 * structure for users that won't pass the server-side check.
 */
export function RoleGuard({
    allowed,
    fallback = null,
    redirectTo,
    children,
}: RoleGuardProps) {
    const { user, isLoading } = useAuth();
    const router = useRouter();
    const hasAccess = !!user && allowed.includes(user.role);

    useEffect(() => {
        if (!isLoading && !hasAccess && redirectTo) {
            router.replace(redirectTo);
        }
    }, [isLoading, hasAccess, redirectTo, router]);

    if (isLoading) return null;
    if (!hasAccess) return <>{fallback}</>;
    return <>{children}</>;
}

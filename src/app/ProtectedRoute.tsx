import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";

import { useMeQuery } from "@/features/auth/api/useAuthQuery";
import { AuthShellLoader } from "@/shared/components/AuthShellLoader";

type ProtectedRouteProps = {
	children: ReactNode;
};

export function ProtectedRoute({ children }: ProtectedRouteProps) {
	const { data: user, isPending } = useMeQuery();

	if (isPending) return <AuthShellLoader />;
	if (!user) return <Navigate to="/login" replace />;

	return children;
}

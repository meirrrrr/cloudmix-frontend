import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";

import { useMeQuery } from "@/features/auth/api/useAuthQuery";
import { AuthShellLoader } from "@/shared/components/AuthShellLoader";

type GuestRouteProps = {
	children: ReactNode;
};

export function GuestRoute({ children }: GuestRouteProps) {
	const { data: user, isPending } = useMeQuery();

	if (isPending) return <AuthShellLoader />;
	if (user) return <Navigate to="/chat" replace />;

	return children;
}

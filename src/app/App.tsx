import { Navigate, Route, Routes } from "react-router-dom";

import { useMeQuery } from "@/features/auth/hooks/use-auth-query";
import ChatPage from "@/pages/chat/ChatPage";
import LoginPage from "@/pages/auth/LoginPage";
import RegistrationPage from "@/pages/auth/RegistrationPage";
import LandingPage from "@/pages/Landing";

export function App() {
	const { data: user, isPending } = useMeQuery();

	if (isPending) {
		return (
			<div className="flex min-h-screen items-center justify-center bg-[#f4f5f9] text-sm text-[#6f738f]">
				Restoring session...
			</div>
		);
	}

	return (
		<Routes>
			<Route path="/" element={<LandingPage />} />
			<Route path="/chat" element={user ? <ChatPage /> : <Navigate to="/login" replace />} />
			<Route path="/login" element={user ? <Navigate to="/chat" replace /> : <LoginPage />} />
			<Route path="/register" element={user ? <Navigate to="/chat" replace /> : <RegistrationPage />} />
			<Route path="*" element={<Navigate to="/" replace />} />
		</Routes>
	);
}

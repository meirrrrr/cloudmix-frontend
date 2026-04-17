import { Navigate, Route, Routes } from "react-router-dom";

import { useMeQuery } from "@/features/auth/api/useAuthQuery";
import ChatPage from "@/pages/chat/ChatPage";
import LoginPage from "@/pages/auth/LoginPage";
import RegistrationPage from "@/pages/auth/RegistrationPage";
import WelcomePage from "@/pages/welcome/WelcomePage";
import { ChatLoader } from "@/shared/components/ChatLoader";

export function App() {
	const { data: user, isPending } = useMeQuery();
	if (isPending) return <ChatLoader />;

	return (
		<Routes>
			<Route path="/" element={<WelcomePage />} />
			<Route path="/chat" element={user ? <ChatPage /> : <Navigate to="/login" replace />} />
			<Route path="/chat/:chatId" element={user ? <ChatPage /> : <Navigate to="/login" replace />} />
			<Route path="/login" element={!user ? <LoginPage /> : <ChatPage />} />
			<Route path="/register" element={!user ? <RegistrationPage /> : <ChatPage />} />
			<Route path="*" element={<Navigate to="/" replace />} />
		</Routes>
	);
}

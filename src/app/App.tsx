import { Navigate, Route, Routes } from "react-router-dom";

import { useMeQuery } from "@/features/auth/api/useAuthQuery";
import ChatPage from "@/pages/chat/ChatPage";
import LoginPage from "@/pages/auth/LoginPage";
import RegistrationPage from "@/pages/auth/RegistrationPage";
import WelcomePage from "@/pages/welcome/WelcomePage";
import { ChatLoader } from "@/shared/components/ChatLoader";

export function App() {
	const { data: user, isPending } = useMeQuery();

	const sessionLoadingElement = <ChatLoader />;

	const chatRouteElement = isPending ? sessionLoadingElement : user ? <ChatPage /> : <Navigate to="/login" replace />;

	const chatIdRouteElement = isPending ? (
		sessionLoadingElement
	) : user ? (
		<ChatPage />
	) : (
		<Navigate to="/login" replace />
	);

	return (
		<Routes>
			<Route path="/" element={<WelcomePage />} />
			<Route path="/chat" element={chatRouteElement} />
			<Route path="/chat/:chatId" element={chatIdRouteElement} />
			<Route path="/login" element={user ? <Navigate to="/chat" replace /> : <LoginPage />} />
			<Route path="/register" element={user ? <Navigate to="/chat" replace /> : <RegistrationPage />} />
			<Route path="*" element={<Navigate to="/" replace />} />
		</Routes>
	);
}

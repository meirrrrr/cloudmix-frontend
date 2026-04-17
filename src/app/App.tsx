import { Navigate, Route, Routes } from "react-router-dom";

import { GuestRoute } from "./GuestRoute";
import { ProtectedRoute } from "./ProtectedRoute";
import ChatPage from "@/pages/chat/ChatPage";
import LoginPage from "@/pages/auth/LoginPage";
import RegistrationPage from "@/pages/auth/RegistrationPage";
import WelcomePage from "@/pages/welcome/WelcomePage";

export function App() {
	return (
		<Routes>
			<Route path="/" element={<WelcomePage />} />
			<Route
				path="/chat"
				element={
					<ProtectedRoute>
						<ChatPage />
					</ProtectedRoute>
				}
			/>
			<Route
				path="/chat/:chatId"
				element={
					<ProtectedRoute>
						<ChatPage />
					</ProtectedRoute>
				}
			/>
			<Route
				path="/login"
				element={
					<GuestRoute>
						<LoginPage />
					</GuestRoute>
				}
			/>
			<Route
				path="/register"
				element={
					<GuestRoute>
						<RegistrationPage />
					</GuestRoute>
				}
			/>
			<Route path="*" element={<Navigate to="/" replace />} />
		</Routes>
	);
}

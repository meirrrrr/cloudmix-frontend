import { Navigate, Route, Routes } from "react-router-dom";

import { useMeQuery } from "@/features/auth/hooks/use-auth-query";
import ChatPage from "@/pages/chat/ChatPage";
import LoginPage from "@/pages/auth/LoginPage";
import RegistrationPage from "@/pages/auth/RegistrationPage";
import LandingPage from "@/pages/Landing";

export function App() {
	const { data: user, isPending } = useMeQuery();

	const sessionLoadingElement = (
		<div className="flex h-screen flex-col overflow-hidden bg-white">
			<div className="flex items-center h-[90px] justify-between border-b border-[#e5e7ee] bg-[#fbfbfd] px-6 py-4">
				<div className="h-8 w-32 animate-pulse rounded-md bg-[#eceef4]" />
				<div className="flex flex-col items-end gap-2">
					<div className="h-4 w-24 animate-pulse rounded bg-[#eceef4]" />
					<div className="h-3 w-16 animate-pulse rounded bg-[#f0f1f6]" />
				</div>
			</div>

			<div className="flex min-h-0 flex-1 overflow-hidden">
				<aside className="hidden w-[510px] border-r border-[#e5e7ee] bg-[#fdfdff] md:block">
					<div className="border-b border-[#eceef4] px-6 py-5">
						<div className="h-7 w-44 animate-pulse rounded bg-[#eceef4]" />
						<div className="mt-4 h-11 w-full animate-pulse rounded-xl bg-[#f1f3f8]" />
					</div>
					<div className="px-6 py-4">
						<div className="space-y-4">
							{Array.from({ length: 6 }).map((_, index) => (
								<div key={index} className="space-y-2 border-b border-[#f0f1f6] pb-4">
									<div className="h-4 w-32 animate-pulse rounded bg-[#eceef4]" />
									<div className="h-3 w-full animate-pulse rounded bg-[#f1f3f8]" />
								</div>
							))}
						</div>
					</div>
				</aside>

				<main className="flex min-h-0 min-w-0 flex-1 flex-col bg-white">
					<div className="border-b border-[#eceef4] px-5 py-4 md:px-6">
						<div className="h-5 w-40 animate-pulse rounded bg-[#eceef4]" />
					</div>
					<div className="flex-1 space-y-4 overflow-hidden px-5 py-6 md:px-8">
						{Array.from({ length: 7 }).map((_, index) => (
							<div
								key={index}
								className={`h-14 animate-pulse rounded-2xl bg-[#f1f3f8] ${
									index % 2 === 0 ? "w-[78%]" : "ml-auto w-[64%]"
								}`}
							/>
						))}
					</div>
					<div className="border-t border-[#eceef4] px-5 py-4 md:px-6">
						<div className="h-12 w-full animate-pulse rounded-2xl bg-[#f1f3f8]" />
					</div>
				</main>
			</div>
		</div>
	);
	const chatRouteElement = isPending ? sessionLoadingElement : user ? <ChatPage /> : <Navigate to="/login" replace />;

	return (
		<Routes>
			<Route path="/" element={<LandingPage />} />
			<Route path="/chat" element={chatRouteElement} />
			<Route path="/chat/:chatId" element={chatRouteElement} />
			<Route path="/login" element={user ? <Navigate to="/chat" replace /> : <LoginPage />} />
			<Route path="/register" element={user ? <Navigate to="/chat" replace /> : <RegistrationPage />} />
			<Route path="*" element={<Navigate to="/" replace />} />
		</Routes>
	);
}

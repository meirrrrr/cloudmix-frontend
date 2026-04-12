import { Header } from "@/features/header/components/Header";
import { ChatMainPanel } from "@/features/chat-main-panel";

export default function ChatPage() {
	return (
		<div className="chat-page-transition flex h-screen flex-col overflow-hidden">
			<div className="flex min-h-0 w-full flex-1 flex-col overflow-hidden bg-white">
				<Header />
				<ChatMainPanel />
			</div>
		</div>
	);
}

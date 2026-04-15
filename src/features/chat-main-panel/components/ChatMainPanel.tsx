import { ConversationProvider } from "../context/ConversationContext";
import { MessageComposerProvider } from "../context/MessageComposerContext";
import { TypingProvider } from "../context/TypingContext";
import { Sidebar } from "@/features/sidebar/components/Sidebar";
import { ConversationThread } from "@/features/chat-thread";

export function ChatMainPanel() {
	return (
		<ConversationProvider>
			<MessageComposerProvider>
				<TypingProvider>
					<div className="flex min-h-0 flex-1 flex-col overflow-hidden md:flex-row">
						<Sidebar />
						<ConversationThread />
					</div>
				</TypingProvider>
			</MessageComposerProvider>
		</ConversationProvider>
	);
}

import { useMemo } from "react";
import { useParams } from "react-router-dom";

import { useConversationQuery } from "@/features/chat-main-panel/api/useConversationsQuery";
import { Sidebar } from "@/features/sidebar/components/Sidebar";
import { ConversationThread } from "@/features/chat-thread";
import { useChatWebSocket } from "../hooks/useChatWebsockets";
import { useConversationHistory } from "../hooks/useConversationHistory";
import { mergeMessages } from "../lib/utils";

export function ChatMainPanel() {
	const { chatId } = useParams<{ chatId?: string }>();
	const { data: conversationData } = useConversationQuery(Number(chatId));
	const selectedConversation = conversationData ?? null;

	const {
		realtimeMessages,
		presenceByUserId,
		typingByUserId,
		sendTyping,
		lastError: websocketError,
	} = useChatWebSocket({ conversationId: selectedConversation?.id });

	const {
		historyMessages,
		historyError,
		isHistoryLoading,
		hasMoreHistory,
		isLoadingMoreHistory,
		isPrependingHistory,
		loadOlderHistory,
	} = useConversationHistory({ selectedConversation });

	const messages = useMemo(
		() => (selectedConversation?.id ? mergeMessages(historyMessages, realtimeMessages) : []),
		[selectedConversation?.id, historyMessages, realtimeMessages],
	);

	const peerIsTyping = Boolean(selectedConversation?.peer?.id && typingByUserId[selectedConversation.peer.id]);

	return (
		<div className="flex min-h-0 flex-1 flex-col overflow-hidden md:flex-row">
			<Sidebar selectedConversation={selectedConversation} />
			<ConversationThread
				selectedConversation={selectedConversation}
				presenceByUserId={presenceByUserId}
				peerIsTyping={peerIsTyping}
				sendTyping={sendTyping}
				messages={messages}
				chatError={historyError ?? websocketError}
				isHistoryLoading={isHistoryLoading}
				hasMoreHistory={hasMoreHistory}
				isLoadingMoreHistory={isLoadingMoreHistory}
				isPrependingHistory={isPrependingHistory}
				loadOlderHistory={loadOlderHistory}
			/>
		</div>
	);
}

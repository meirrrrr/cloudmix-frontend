import { useCallback, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { useChatWebSocket } from "@/features/chat/hooks/use-chat-websocket";
import { CONVERSATIONS_QUERY_KEY } from "@/features/sidebar/hooks/useConversations";
import { Sidebar } from "@/features/sidebar/components/Sidebar";
import { ConversationThread } from "@/features/chat-thread";
import { useConversationHistory } from "@/features/chat-main-panel/hooks/useConversationHistory";
import { useConversationSelection } from "@/features/chat-main-panel/hooks/useConversationSelection";
import { useMessageComposer } from "@/features/chat-main-panel/hooks/useMessageComposer";
import { useTyping } from "@/features/chat-main-panel/hooks/useTyping";

import { mergeMessages } from "../lib/chat-main-panel-utils";

export function ChatMainPanel() {
	// navigation and context
	const queryClient = useQueryClient();
	const { selectedConversation, handleSelectConversation, hasChatInRoute } = useConversationSelection();

	// realtime data
	const {
		realtimeMessages,
		presenceByUserId,
		typingByUserId,
		sendTyping,
		lastError: websocketError,
	} = useChatWebSocket({
		conversationId: selectedConversation?.id ?? null,
	});
	console.log("realtimeMessages", realtimeMessages);

	// query invalidation
	const invalidateConversations = useCallback(() => {
		return queryClient.invalidateQueries({ queryKey: CONVERSATIONS_QUERY_KEY });
	}, [queryClient]);

	// conversation history
	const {
		historyMessages,
		historyError,
		isHistoryLoading,
		hasMoreHistory,
		isLoadingMoreHistory,
		isPrependingHistory,
		loadOlderHistory,
	} = useConversationHistory({
		selectedConversation,
		onConversationRead: invalidateConversations,
	});

	// message composer
	const { draftMessage, composerError, isSending, sendStatus, handleComposerChange, handleComposerSubmit } =
		useMessageComposer({
			selectedConversation,
			onMessageCreated: invalidateConversations,
		});

	// typing indicator
	const { stopTyping, handleTypingChange } = useTyping({
		selectedConversationId: selectedConversation?.id ?? null,
		sendTyping,
		onComposerChange: handleComposerChange,
	});

	// derived values
	const threadMessages = useMemo(() => {
		if (!selectedConversation) return undefined;
		return mergeMessages(historyMessages, realtimeMessages);
	}, [selectedConversation, historyMessages, realtimeMessages]);

	const chatError = historyError ?? websocketError;

	// event handlers
	const handleThreadComposerChange = useCallback(
		(value: string) => {
			handleTypingChange(value);
		},
		[handleTypingChange],
	);

	const handleThreadComposerSubmit = useCallback(async () => {
		await handleComposerSubmit();
		stopTyping();
	}, [handleComposerSubmit, stopTyping]);

	const peerIsTyping = Boolean(selectedConversation && typingByUserId[selectedConversation.peer.id]);

	return (
		<div className="flex min-h-0 flex-1 flex-col overflow-hidden md:flex-row">
			<Sidebar
				hasChatInRoute={hasChatInRoute}
				selectedConversationId={selectedConversation?.id ?? null}
				onSelectConversation={handleSelectConversation}
			/>

			<ConversationThread
				hasChatInRoute={hasChatInRoute}
				selectedConversation={selectedConversation}
				presenceByUserId={presenceByUserId}
				peerIsTyping={peerIsTyping}
				messages={threadMessages}
				socketError={chatError}
				composerValue={draftMessage}
				composerError={composerError}
				isSending={isSending}
				isHistoryLoading={isHistoryLoading}
				hasMoreHistory={hasMoreHistory}
				isLoadingMoreHistory={isLoadingMoreHistory}
				isPrependingHistory={isPrependingHistory}
				sendStatus={sendStatus}
				onComposerChange={handleThreadComposerChange}
				onComposerSubmit={handleThreadComposerSubmit}
				onLoadOlderHistory={loadOlderHistory}
			/>
		</div>
	);
}

import { useCallback, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useMeQuery } from "@/features/auth/hooks/use-auth-query";
import { useChatWebSocket } from "@/features/chat/hooks/use-chat-websocket";
import type { PresenceState } from "@/features/chat/types";
import { CONVERSATIONS_QUERY_KEY } from "@/features/sidebar/hooks/useConversations";
import { Sidebar } from "@/features/sidebar/components/Sidebar";
import { ConversationThread } from "@/features/chat-thread";
import { useConversationHistory } from "@/features/chat-main-panel/hooks/useConversationHistory";
import { useConversationSelection } from "@/features/chat-main-panel/hooks/useConversationSelection";
import { useMessageComposer } from "@/features/chat-main-panel/hooks/useMessageComposer";
import { mergeMessages } from "../lib/chat-main-panel-utils";

export function ChatMainPanel() {
	const queryClient = useQueryClient();
	const { data: me } = useMeQuery();
	const { selectedConversation, handleSelectConversation } = useConversationSelection();

	const {
		realtimeMessages,
		presenceByUserId,
		lastError: websocketError,
	} = useChatWebSocket({
		conversationId: selectedConversation?.id ?? null,
	});

	const invalidateConversations = useCallback(() => {
		return queryClient.invalidateQueries({ queryKey: CONVERSATIONS_QUERY_KEY });
	}, [queryClient]);

	const { historyMessages, historyError, isHistoryLoading, refreshHistory } = useConversationHistory({
		selectedConversation,
		onConversationRead: invalidateConversations,
	});

	const { savedMessages, draftMessage, composerError, isSending, handleComposerChange, handleComposerSubmit } =
		useMessageComposer({
			selectedConversation,
			currentUser: me ?? null,
			onMessageCreated: invalidateConversations,
			refreshHistory,
		});

	const threadMessages = useMemo(
		() => mergeMessages(historyMessages, savedMessages, realtimeMessages),
		[historyMessages, realtimeMessages, savedMessages],
	);

	const peerPresence = useMemo(() => {
		if (!selectedConversation) {
			return null;
		}

		const fallbackPresence: PresenceState = {
			is_online: selectedConversation.peer.is_online,
			last_seen_at: selectedConversation.peer.last_seen_at,
		};

		return presenceByUserId[selectedConversation.peer.id] ?? fallbackPresence;
	}, [presenceByUserId, selectedConversation]);

	const chatError = historyError ?? websocketError;

	return (
		<div className="flex min-h-0 flex-1 flex-col overflow-hidden md:flex-row">
			<Sidebar
				selectedConversationId={selectedConversation?.id ?? null}
				onSelectConversation={handleSelectConversation}
				presenceByUserId={presenceByUserId}
			/>
			<ConversationThread
				hasActiveConversation={Boolean(selectedConversation)}
				contactName={selectedConversation?.peer.display_name}
				peerIsOnline={peerPresence?.is_online}
				peerLastSeenAt={peerPresence?.last_seen_at ?? null}
				messages={selectedConversation ? threadMessages : undefined}
				currentUserId={me?.id}
				socketError={chatError}
				composerValue={draftMessage}
				composerError={composerError}
				isSending={isSending}
				isHistoryLoading={isHistoryLoading}
				onComposerChange={handleComposerChange}
				onComposerSubmit={handleComposerSubmit}
			/>
		</div>
	);
}

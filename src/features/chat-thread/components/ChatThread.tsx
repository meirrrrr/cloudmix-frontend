import { useCallback } from "react";
import { useNavigate } from "react-router-dom";

import { useMeQuery } from "@/features/auth/api/useAuthQuery";
import { ChatHeader } from "@/features/chat-header";
import { ChatMessages } from "@/features/chat-messages";
import { MessageComposer } from "@/features/chat-message-input";
import { useConversationContext } from "@/features/chat-main-panel/context/ConversationContext";
import { useMessageComposerContext } from "@/features/chat-main-panel/context/MessageComposerContext";
import { useTypingContext } from "@/features/chat-main-panel/context/TypingContext";
import type { PresenceState } from "@/features/chat-messages/types";

import { useConversationThreadAutoScroll } from "../hooks/useConversationThreadAutoScroll";
import { getPresenceLabel } from "../lib/utils";
import { ChatPlaceholder } from "./ChatPlaceholder";
import { ChatLoader } from "../../../shared/components/ChatLoader";

export function ConversationThread() {
	const navigate = useNavigate();
	const { data: me } = useMeQuery();

	const {
		selectedConversation,
		hasChatInRoute,
		presenceByUserId,
		peerIsTyping,
		messages,
		chatError,
		isHistoryLoading,
		hasMoreHistory,
		isLoadingMoreHistory,
		isPrependingHistory,
		loadOlderHistory,
		invalidateConversations,
	} = useConversationContext();

	const { composerValue, composerError, isSending, sendStatus } = useMessageComposerContext();
	const { handleComposerChange, handleComposerSubmit } = useTypingContext();

	const hasActiveConversation = Boolean(selectedConversation);
	const peerData = selectedConversation?.peer ?? null;
	const contactName = peerData?.display_name ?? "";

	// ui state
	const isResolvingConversation = hasChatInRoute && !hasActiveConversation;
	const showInitialHistoryLoader = hasActiveConversation && isHistoryLoading && messages.length === 0;
	const showPlaceholder = !hasActiveConversation && !isResolvingConversation;
	const threadContainerClassName = hasChatInRoute
		? "flex min-h-0 min-w-0 flex-1"
		: "hidden md:flex md:min-h-0 md:min-w-0 md:flex-1";

	// derived state
	const peerPresence: PresenceState | null = peerData
		? (presenceByUserId[peerData.id] ?? {
				is_online: peerData.is_online ?? false,
				last_seen_at: peerData.last_seen_at,
			})
		: null;
	const peerIsOnline = peerPresence?.is_online ?? false;
	const peerLastSeenAt = peerPresence?.last_seen_at ?? null;
	const presenceLabel = getPresenceLabel(peerIsOnline, peerLastSeenAt);

	const messageListRef = useConversationThreadAutoScroll({
		conversationId: selectedConversation?.id,
		messagesCount: messages.length,
		isHistoryLoading,
		isPrependingHistory,
	});

	const handleBackToList = useCallback(() => {
		navigate("/chat");
		void invalidateConversations();
	}, [navigate, invalidateConversations]);

	if (isResolvingConversation || showInitialHistoryLoader) {
		return <ChatLoader />;
	}

	if (showPlaceholder || !contactName) {
		return (
			<div className="hidden md:flex md:min-h-0 md:min-w-0 md:flex-1">
				<ChatPlaceholder />
			</div>
		);
	}

	return (
		<div className={threadContainerClassName}>
			<section className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-[#F2F1F4]">
				<ChatHeader
					peerIsTyping={peerIsTyping}
					contactName={contactName}
					presenceLabel={presenceLabel}
					onBackToList={hasChatInRoute ? handleBackToList : undefined}
				/>

				<div ref={messageListRef} className="min-h-0 flex-1 overflow-y-auto border-l border-[#e5e7ee] p-8">
					<ChatMessages
						messages={messages}
						currentUserId={me?.id}
						sendStatus={sendStatus}
						isHistoryLoading={isHistoryLoading}
						hasMoreHistory={hasMoreHistory}
						isLoadingMoreHistory={isLoadingMoreHistory}
						chatError={chatError}
						onLoadOlderHistory={loadOlderHistory}
					/>
				</div>

				<MessageComposer
					value={composerValue}
					onChange={handleComposerChange}
					onSend={handleComposerSubmit}
					disabled={!hasActiveConversation}
					isSending={isSending}
					error={composerError}
				/>
			</section>
		</div>
	);
}

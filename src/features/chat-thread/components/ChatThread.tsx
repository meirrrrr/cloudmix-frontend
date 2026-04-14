import { useCallback } from "react";
import { useNavigate } from "react-router-dom";

import { useMeQuery } from "@/features/auth/hooks/use-auth-query";
import { ChatHeader } from "@/features/chat-header";
import { ChatMessages } from "@/features/chat-messages";
import { MessageComposer } from "@/features/chat-message-input/components/MessageComposer";
import type { PresenceState } from "@/features/chat-messages/types";

import { useConversationThreadAutoScroll } from "../hooks/useConversationThreadAutoScroll";
import { getPresenceLabel } from "../lib/utils";
import type { ConversationThreadProps } from "../types";
import { ChatPlaceholder } from "./ChatPlaceholder";
import { ChatLoader } from "./ChatLoader";

export function ConversationThread({
	hasChatInRoute,
	selectedConversation,
	presenceByUserId,
	peerIsTyping,
	messages = [],
	chatError,
	composerValue,
	composerError = null,
	isSending = false,
	isHistoryLoading = false,
	hasMoreHistory = false,
	isLoadingMoreHistory = false,
	isPrependingHistory = false,
	sendStatus = { phase: "idle", messageId: null },
	onComposerChange,
	onComposerSubmit,
	onLoadOlderHistory,
}: ConversationThreadProps) {
	const navigate = useNavigate();
	const { data: me } = useMeQuery();
	// chat state
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

	// peer
	const peerPresence: PresenceState | null = peerData
		? (presenceByUserId[peerData.id] ?? {
				is_online: peerData.is_online ?? false,
				last_seen_at: peerData.last_seen_at,
			})
		: null;

	const peerIsOnline = peerPresence?.is_online ?? false;
	const peerLastSeenAt = peerPresence?.last_seen_at ?? null;
	const presenceLabel = getPresenceLabel(peerIsOnline, peerLastSeenAt);

	// messages
	const messageListRef = useConversationThreadAutoScroll({
		conversationId: selectedConversation?.id,
		messagesCount: messages.length,
		isHistoryLoading,
		isPrependingHistory,
	});

	// handlers
	const handleBackToList = useCallback(() => {
		navigate("/chat");
	}, [navigate]);

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
						onLoadOlderHistory={onLoadOlderHistory}
					/>
				</div>

				<MessageComposer
					value={composerValue}
					onChange={onComposerChange}
					onSend={onComposerSubmit}
					disabled={!hasActiveConversation}
					isSending={isSending}
					error={composerError}
				/>
			</section>
		</div>
	);
}

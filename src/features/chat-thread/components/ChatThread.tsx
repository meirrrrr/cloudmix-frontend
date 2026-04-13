import { MessageComposer } from "../../chat/components/MessageComposer";

import { ChatHeader } from "@/features/chat-header";
import { ChatMessages } from "@/features/chat-messages";
import { ConversationThreadPlaceholder } from "./ChatPlaceholder";
import type { ConversationThreadProps } from "../types";
import { getPresenceLabel } from "../lib/utils";
import { useConversationThreadAutoScroll } from "../hooks/useConversationThreadAutoScroll";
import { useConversationThreadMessageVisibility } from "../hooks/useConversationThreadMessageVisibility";
import type { PresenceState } from "@/features/chat/types";
import { ChatTypingIndicator } from "./ChatTypingIndicator";
import { ChatLoader } from "./ChatLoader";

export function ConversationThread({
	hasChatInRoute,
	selectedConversation,
	presenceByUserId,
	peerIsTyping,
	onBackToList,
	messages = [],
	currentUserId,
	socketError = null,
	composerValue,
	composerError = null,
	isSending = false,
	isHistoryLoading = false,
	hasMoreHistory = false,
	isLoadingMoreHistory = false,
	isPrependingHistory = false,
	onComposerChange,
	onComposerSubmit,
	onLoadOlderHistory,
}: ConversationThreadProps) {
	// chat state
	const hasActiveConversation = Boolean(selectedConversation);
	const peerData = selectedConversation?.peer ?? null;
	const contactName = peerData?.display_name ?? "";

	// ui state
	const isResolvingConversation = hasChatInRoute && !hasActiveConversation;
	const showInitialHistoryLoader = hasActiveConversation && isHistoryLoading && messages.length === 0;
	const showPlaceholder = !hasActiveConversation && !isResolvingConversation;

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
		messagesCount: messages.length,
		isHistoryLoading,
		isPrependingHistory,
	});
	const visibleMessageIds = useConversationThreadMessageVisibility({
		messages,
		contactName,
		isHistoryLoading,
	});

	// ui
	const threadContainerClassName = hasChatInRoute
		? "flex min-h-0 min-w-0 flex-1"
		: "hidden md:flex md:min-h-0 md:min-w-0 md:flex-1";

	if (isResolvingConversation || showInitialHistoryLoader) {
		return <ChatLoader />;
	}

	if (showPlaceholder || !contactName) {
		return <ConversationThreadPlaceholder />;
	}

	return (
		<div className={threadContainerClassName}>
			<section className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-[#F2F1F4]">
				<ChatHeader contactName={contactName} presenceLabel={presenceLabel} onBackToList={onBackToList} />

				<div ref={messageListRef} className="min-h-0 flex-1 overflow-y-auto border-l border-[#e5e7ee] p-8">
					<ChatMessages
						messages={messages}
						currentUserId={currentUserId}
						visibleMessageIds={visibleMessageIds}
						isHistoryLoading={isHistoryLoading}
						hasMoreHistory={hasMoreHistory}
						isLoadingMoreHistory={isLoadingMoreHistory}
						socketError={socketError}
						onLoadOlderHistory={onLoadOlderHistory}
					/>
				</div>

				<ChatTypingIndicator isVisible={peerIsTyping} contactName={contactName} />

				<div className="shrink-0">
					<MessageComposer
						value={composerValue}
						onChange={onComposerChange}
						onSend={onComposerSubmit}
						disabled={!hasActiveConversation}
						isSending={isSending}
						error={composerError}
					/>
				</div>
			</section>
		</div>
	);
}

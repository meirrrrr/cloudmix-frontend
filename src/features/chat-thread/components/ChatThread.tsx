import { useMemo } from "react";
import { MessageComposer } from "../../chat/components/MessageComposer";
import { ConversationThreadHeader } from "./ChatHeader";
import { ConversationThreadMessages } from "./ChatMessages";
import { ConversationThreadPlaceholder } from "./ChatPlaceholder";
import type { ConversationThreadProps } from "../types";
import { getPresenceLabel } from "../lib/utils";
import { useConversationThreadAutoScroll } from "../hooks/useConversationThreadAutoScroll";
import { useConversationThreadMessageVisibility } from "../hooks/useConversationThreadMessageVisibility";

/**
 * Renders the active conversation thread with messages and composer.
 */
export function ConversationThread({
	contactName,
	peerIsOnline = false,
	peerLastSeenAt = null,
	hasActiveConversation = false,
	messages = [],
	currentUserId,
	socketError = null,
	composerValue,
	composerError = null,
	isSending = false,
	isHistoryLoading = false,
	onComposerChange,
	onComposerSubmit,
}: ConversationThreadProps) {
	const isComposerDisabled = !hasActiveConversation;
	const presenceLabel = useMemo(() => getPresenceLabel(peerIsOnline, peerLastSeenAt), [peerIsOnline, peerLastSeenAt]);
	const messageListRef = useConversationThreadAutoScroll({
		messagesCount: messages.length,
		isHistoryLoading,
	});
	const visibleMessageIds = useConversationThreadMessageVisibility({
		messages,
		contactName,
		isHistoryLoading,
	});

	if (!contactName) {
		return <ConversationThreadPlaceholder />;
	}

	return (
		<section className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-[#F2F1F4]">
			<ConversationThreadHeader contactName={contactName} presenceLabel={presenceLabel} />

			<div ref={messageListRef} className="min-h-0 flex-1 overflow-y-auto p-8">
				<ConversationThreadMessages
					messages={messages}
					currentUserId={currentUserId}
					visibleMessageIds={visibleMessageIds}
					isHistoryLoading={isHistoryLoading}
					socketError={socketError}
				/>
			</div>

			<div className="shrink-0">
				<MessageComposer
					value={composerValue}
					onChange={onComposerChange}
					onSend={onComposerSubmit}
					disabled={isComposerDisabled}
					isSending={isSending}
					error={composerError}
				/>
			</div>
		</section>
	);
}

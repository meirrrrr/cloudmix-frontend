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
	peerIsTyping = false,
	peerLastSeenAt = null,
	hasActiveConversation = false,
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
	const isComposerDisabled = !hasActiveConversation;
	const presenceLabel = useMemo(() => getPresenceLabel(peerIsOnline, peerLastSeenAt), [peerIsOnline, peerLastSeenAt]);
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

	if (!contactName) {
		return <ConversationThreadPlaceholder />;
	}

	return (
		<section className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-[#F2F1F4]">
			<ConversationThreadHeader
				contactName={contactName}
				presenceLabel={presenceLabel}
				onBackToList={onBackToList}
			/>

			<div ref={messageListRef} className="min-h-0 flex-1 overflow-y-auto p-8">
				<ConversationThreadMessages
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

			{peerIsTyping ? (
				<div className="shrink-0 px-6 pb-1 md:px-8">
					<div className="inline-flex items-center gap-2 rounded-[16px] rounded-bl-[10px] border border-[#e7e9f0] bg-white px-4 py-2 text-sm text-[#707690]">
						<span>{contactName} is typing</span>
						<span className="flex items-center gap-1">
							<span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#a0a6bc]" />
							<span
								className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#a0a6bc]"
								style={{ animationDelay: "120ms" }}
							/>
							<span
								className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#a0a6bc]"
								style={{ animationDelay: "240ms" }}
							/>
						</span>
					</div>
				</div>
			) : null}

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

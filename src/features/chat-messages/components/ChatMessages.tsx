import { toChatMessage } from "@/features/chat-thread/lib/utils";
import type { ComposerSendStatus } from "@/features/chat-main-panel/hooks/useMessageComposer";

import type { ChatMessagePayload } from "../types";
import { buildThreadItems } from "../lib/utils";
import { DateDivider } from "./DateDivider";
import { EmptyMessages } from "./EmptyMessages";
import { MessageBubble } from "./MessageBubble";

interface ChatMessagesProps {
	messages: ChatMessagePayload[];
	currentUserId?: number;
	sendStatus: ComposerSendStatus;
	isHistoryLoading: boolean;
	hasMoreHistory: boolean;
	isLoadingMoreHistory: boolean;
	chatError: string | null;
	onLoadOlderHistory?: () => Promise<void> | void;
}

export function ChatMessages({
	messages,
	currentUserId,
	sendStatus,
	isHistoryLoading,
	hasMoreHistory,
	isLoadingMoreHistory,
	chatError,
	onLoadOlderHistory,
}: ChatMessagesProps) {
	const hasMessages = messages.length > 0;
	const threadItems = buildThreadItems(messages);
	const hasSentMessage = sendStatus.messageId
		? messages.some((message) => message.id === sendStatus.messageId)
		: false;
	const shouldShowSendingState = sendStatus.phase === "sending";
	const shouldShowSentState = sendStatus.phase === "sent" && hasSentMessage;
	const shouldShowFailedState = sendStatus.phase === "failed";
	const showStatus = shouldShowSendingState || shouldShowSentState || shouldShowFailedState;
	const sendStatusText = shouldShowSendingState ? "Sending..." : shouldShowSentState ? "Sent" : "Failed to send";
	const sendStatusClassName =
		sendStatus.phase === "failed"
			? "text-[#d14343]"
			: sendStatus.phase === "sent"
				? "text-[#3e7a1f]"
				: "text-[#6f738f]";

	return (
		<div className="space-y-4">
			{hasMoreHistory ? (
				<div className="flex justify-center">
					<button
						type="button"
						onClick={() => {
							void onLoadOlderHistory?.();
						}}
						disabled={isLoadingMoreHistory || !onLoadOlderHistory}
						className="rounded-md border px-3 py-1 text-sm"
					>
						{isLoadingMoreHistory ? "Loading..." : "Load older messages"}
					</button>
				</div>
			) : null}

			{hasMessages ? (
				<div className="space-y-4">
					{threadItems.map((item) =>
						item.type === "divider" ? (
							<DateDivider key={item.key} label={item.label} />
						) : (
							<MessageBubble
								key={item.message.id}
								// animateIn={visibleMessageIds[item.message.id] ?? true}
								message={toChatMessage(item.message, currentUserId)}
							/>
						),
					)}
				</div>
			) : isHistoryLoading ? null : (
				<EmptyMessages />
			)}

			{chatError ? <p className="text-sm text-[#d14343]">Chat error: {chatError}</p> : null}
			{showStatus ? (
				<p className={`text-right text-xs font-medium transition-opacity duration-200 ${sendStatusClassName}`}>
					{sendStatusText}
				</p>
			) : null}
		</div>
	);
}

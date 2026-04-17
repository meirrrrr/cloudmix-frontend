import { useRef } from "react";

import { toChatMessage } from "@/features/chat-thread/lib/utils";
import type { ComposerSendStatus } from "@/features/chat-main-panel/hooks/useMessageComposer";
import type { ChatMessagePayload } from "../types";
import { buildThreadItems, getSendStatusDisplay } from "../lib/utils";
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
	const bottomAnchorRef = useRef<HTMLDivElement | null>(null);

	const threadItems = buildThreadItems(messages);

	const hasSentMessage = Boolean(sendStatus.messageId && messages.some((m) => m.id === sendStatus.messageId));
	const statusDisplay = getSendStatusDisplay(sendStatus, hasSentMessage);

	return (
		<div className="space-y-4">
			{hasMoreHistory ? (
				<div className="flex justify-center">
					<button
						type="button"
						onClick={() => {
							if (!isLoadingMoreHistory) void onLoadOlderHistory?.();
						}}
						disabled={isLoadingMoreHistory || !onLoadOlderHistory}
						className="inline-flex items-center gap-2 rounded-full border border-[#d9dbe7] bg-white/80 px-4 py-1.5 text-sm font-medium text-[#3d4159] shadow-sm transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-70"
					>
						{isLoadingMoreHistory ? (
							<>
								<span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-[#9aa1be] border-t-transparent" />
								Loading older messages...
							</>
						) : (
							"Load older messages"
						)}
					</button>
				</div>
			) : null}

			{hasMessages ? (
				<div className="space-y-4">
					{threadItems.map((item) =>
						item.type === "divider" ? (
							<DateDivider key={item.key} label={item.label} />
						) : (
							<MessageBubble key={item.message.id} message={toChatMessage(item.message, currentUserId)} />
						),
					)}
					<div ref={bottomAnchorRef} className="h-0" />
				</div>
			) : isHistoryLoading ? null : (
				<EmptyMessages />
			)}

			{chatError ? <p className="text-sm text-[#d14343]">Chat error: {chatError}</p> : null}

			{statusDisplay ? (
				<p
					className={`text-right text-xs font-medium transition-opacity duration-200 ${statusDisplay.className}`}
				>
					{statusDisplay.label}
				</p>
			) : null}
		</div>
	);
}

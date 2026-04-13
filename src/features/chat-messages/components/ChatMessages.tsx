import { MessageBubble } from "@/features/chat/components/MessageBubble";
import { toChatMessage } from "@/features/chat-thread/lib/utils";
import type { ChatMessagePayload } from "@/features/chat/types";
import type { MessageVisibilityMap } from "@/features/chat-thread/hooks/useConversationThreadMessageVisibility";

interface ChatMessagesProps {
	messages: ChatMessagePayload[];
	currentUserId?: number;
	visibleMessageIds: MessageVisibilityMap;
	isHistoryLoading: boolean;
	hasMoreHistory: boolean;
	isLoadingMoreHistory: boolean;
	socketError: string | null;
	onLoadOlderHistory?: () => Promise<void> | void;
}

export function ChatMessages({
	messages,
	currentUserId,
	visibleMessageIds,
	isHistoryLoading,
	hasMoreHistory,
	isLoadingMoreHistory,
	socketError,
	onLoadOlderHistory,
}: ChatMessagesProps) {
	const hasMessages = messages.length > 0;
	const threadItems = buildThreadItems(messages);

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
								animateIn={visibleMessageIds[item.message.id] ?? true}
								message={toChatMessage(item.message, currentUserId)}
							/>
						),
					)}
				</div>
			) : isHistoryLoading ? null : (
				<EmptyMessages />
			)}

			{socketError ? <p className="text-sm text-[#d14343]">Chat error: {socketError}</p> : null}
		</div>
	);
}

function DateDivider({ label }: { label: string }) {
	return (
		<div className="flex items-center gap-4 text-xs text-[#9a9eb6]">
			<div className="h-px flex-1 bg-[#dfe2ec]" />
			<span className="text-[16px] font-[400] text-[#180A29] opacity-50">{label}</span>
			<div className="h-px flex-1 bg-[#dfe2ec]" />
		</div>
	);
}

function buildThreadItems(messages: ChatMessagePayload[]): Array<ThreadDividerItem | ThreadMessageItem> {
	const items: Array<ThreadDividerItem | ThreadMessageItem> = [];
	let previousDayKey: string | null = null;

	for (const message of messages) {
		const createdAt = new Date(message.created_at);
		const dayKey = Number.isNaN(createdAt.getTime()) ? "unknown" : formatDayKey(createdAt);
		if (dayKey !== previousDayKey) {
			items.push({
				type: "divider",
				key: `divider-${dayKey}-${message.id}`,
				label: formatDayLabel(createdAt),
			});
			previousDayKey = dayKey;
		}

		items.push({ type: "message", message });
	}

	return items;
}

function formatDayKey(date: Date): string {
	return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

function formatDayLabel(date: Date): string {
	if (Number.isNaN(date.getTime())) {
		return "Unknown date";
	}

	const today = new Date();
	if (isSameDay(date, today)) {
		return "Today";
	}

	const yesterday = new Date(today);
	yesterday.setDate(today.getDate() - 1);
	if (isSameDay(date, yesterday)) {
		return "Yesterday";
	}

	return date.toLocaleDateString([], {
		day: "numeric",
		month: "long",
		year: "numeric",
	});
}

function isSameDay(first: Date, second: Date): boolean {
	return (
		first.getFullYear() === second.getFullYear() &&
		first.getMonth() === second.getMonth() &&
		first.getDate() === second.getDate()
	);
}

interface ThreadDividerItem {
	type: "divider";
	key: string;
	label: string;
}

interface ThreadMessageItem {
	type: "message";
	message: ChatMessagePayload;
}

function EmptyMessages() {
	return (
		<div className="flex min-h-[320px] items-center justify-center px-4">
			<div className="w-full max-w-sm text-center">
				<p className="text-[17px] font-medium tracking-[-0.01em] text-[#261a38]">Start your conversation</p>
				<p className="mt-2 text-sm leading-6 text-[#8b859b]">No messages yet. Send one to begin.</p>
			</div>
		</div>
	);
}

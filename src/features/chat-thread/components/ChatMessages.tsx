import type { ChatMessagePayload } from "../../chat/types";
import { MessageBubble } from "../../chat/components/MessageBubble";
import { SKELETON_MESSAGE_ROWS, toChatMessage } from "../lib/utils";
import type { MessageVisibilityMap } from "../hooks/useConversationThreadMessageVisibility";

interface ConversationThreadMessagesProps {
	messages: ChatMessagePayload[];
	currentUserId?: number;
	visibleMessageIds: MessageVisibilityMap;
	isHistoryLoading: boolean;
	socketError: string | null;
}

/**
 * Renders loading, empty, and populated message states for a conversation thread.
 */
export function ConversationThreadMessages({
	messages,
	currentUserId,
	visibleMessageIds,
	isHistoryLoading,
	socketError,
}: ConversationThreadMessagesProps) {
	const hasMessages = messages.length > 0;
	const threadItems = buildThreadItems(messages);

	return (
		<div className="space-y-4">
			{isHistoryLoading && <DateDivider label="Today" />}

			{isHistoryLoading ? (
				<LoadingMessages />
			) : hasMessages ? (
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
			) : (
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

function LoadingMessages() {
	return (
		<div className="space-y-3">
			{SKELETON_MESSAGE_ROWS.map((index) => (
				<div key={index} className={`flex ${index % 2 === 0 ? "justify-start" : "justify-end"}`}>
					<div className="skeleton-shimmer h-[52px] w-[min(78%,340px)] rounded-[16px] bg-[#e7e9f1]" />
				</div>
			))}
		</div>
	);
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

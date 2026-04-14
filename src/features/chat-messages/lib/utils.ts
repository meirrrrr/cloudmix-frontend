import type { ChatMessagePayload } from "@/features/chat/types";
import type { ThreadDividerItem, ThreadMessageItem } from "../types";

export function buildThreadItems(messages: ChatMessagePayload[]): Array<ThreadDividerItem | ThreadMessageItem> {
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

function isSameDay(first: Date, second: Date): boolean {
	return (
		first.getFullYear() === second.getFullYear() &&
		first.getMonth() === second.getMonth() &&
		first.getDate() === second.getDate()
	);
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

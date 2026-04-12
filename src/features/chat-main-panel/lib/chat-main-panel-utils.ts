import { CreateMessageApiError } from "@/features/chat/api/messages";
import type { ChatMessagePayload, PresenceUser } from "@/features/chat/types";
import { ApiError } from "@/shared/lib/api-client";

export const CHAT_MESSAGE_MAX_LENGTH = 5000;

/** Sorts messages by timestamp, then by id for stable ordering. */
export function sortMessages(messages: ChatMessagePayload[]): ChatMessagePayload[] {
	return [...messages].sort((left, right) => {
		const leftTimestamp = Date.parse(left.created_at);
		const rightTimestamp = Date.parse(right.created_at);

		if (!Number.isNaN(leftTimestamp) && !Number.isNaN(rightTimestamp)) {
			if (leftTimestamp !== rightTimestamp) {
				return leftTimestamp - rightTimestamp;
			}
		} else if (left.created_at !== right.created_at) {
			return left.created_at.localeCompare(right.created_at);
		}

		return left.id - right.id;
	});
}

/** De-duplicates and sorts message groups into a single timeline. */
export function mergeMessages(...groups: ChatMessagePayload[][]): ChatMessagePayload[] {
	const byId = new Map<number, ChatMessagePayload>();
	for (const group of groups) {
		for (const message of group) {
			byId.set(message.id, message);
		}
	}
	return sortMessages([...byId.values()]);
}

/** Maps API and transport errors to a composer-friendly message. */
export function toComposerErrorMessage(error: unknown): string {
	if (error instanceof CreateMessageApiError) {
		if (error.status === 404) {
			return "This conversation is unavailable.";
		}
		return error.message;
	}

	if (error instanceof ApiError) {
		return error.message;
	}

	return "Unable to send message right now. Please try again.";
}

/** Builds a temporary optimistic message while create API is pending. */
export function createOptimisticMessage(
	messageId: number,
	body: string,
	currentUser: PresenceUser | null,
): ChatMessagePayload {
	return {
		id: messageId,
		body,
		created_at: new Date().toISOString(),
		sender: currentUser ?? {
			id: -1,
			username: "you",
			display_name: "You",
			is_online: true,
			last_seen_at: null,
		},
	};
}

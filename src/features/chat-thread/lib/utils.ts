import { formatTimeHHMM } from "@/shared/lib/utils";
import type { ChatMessagePayload } from "../../chat-messages/types";
import type { ChatMessage } from "../../chat-messages/types";

export const SKELETON_MESSAGE_ROWS = [0, 1, 2, 3, 4] as const;

export function getPresenceLabel(peerIsOnline: boolean, peerLastSeenAt: string | null): string {
	if (peerIsOnline) {
		return "Online";
	}

	return formatLastSeen(peerLastSeenAt);
}

export function toChatMessage(message: ChatMessagePayload, currentUserId?: number): ChatMessage {
	const isOutgoing = message.id < 0 || message.sender.id === currentUserId;

	return {
		date: message.created_at,
		id: String(message.id),
		text: message.body,
		direction: isOutgoing ? "outgoing" : "incoming",
	};
}

function formatLastSeen(value: string | null): string {
	if (!value) {
		return "Offline";
	}

	const date = new Date(value);
	if (Number.isNaN(date.getTime())) {
		return "Offline";
	}

	const now = new Date();
	const isToday =
		date.getUTCFullYear() === now.getUTCFullYear() &&
		date.getUTCMonth() === now.getUTCMonth() &&
		date.getUTCDate() === now.getUTCDate();

	if (isToday) {
		return `last seen ${formatTimeHHMM(value)}`;
	}

	const yesterday = new Date(now);
	yesterday.setUTCDate(now.getUTCDate() - 1);

	const isYesterday =
		date.getUTCFullYear() === yesterday.getUTCFullYear() &&
		date.getUTCMonth() === yesterday.getUTCMonth() &&
		date.getUTCDate() === yesterday.getUTCDate();

	if (isYesterday) {
		return "last seen yesterday";
	}

	return `last seen ${date.toLocaleDateString()}`;
}

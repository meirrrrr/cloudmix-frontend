import type { ChatMessagePayload, ChatReceiveEvent } from "@/features/chat-messages/types";

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null;
}

function isParticipantPayload(value: unknown): value is ChatMessagePayload["sender"] {
	if (!isRecord(value)) {
		return false;
	}
	return (
		typeof value.id === "number" &&
		typeof value.username === "string" &&
		typeof value.display_name === "string" &&
		typeof value.is_online === "boolean" &&
		(typeof value.last_seen_at === "string" || value.last_seen_at === null)
	);
}

function isChatMessagePayload(value: unknown): value is ChatMessagePayload {
	if (!isRecord(value)) {
		return false;
	}
	return (
		typeof value.id === "number" &&
		isParticipantPayload(value.sender) &&
		typeof value.body === "string" &&
		typeof value.created_at === "string"
	);
}

export function toChatReceiveEvent(value: unknown): ChatReceiveEvent | null {
	if (!isRecord(value) || typeof value.type !== "string") {
		return null;
	}

	if (value.type === "message") {
		if (!isChatMessagePayload(value.message)) {
			return null;
		}
		return { type: "message", message: value.message };
	}

	if (value.type === "error") {
		if (value.detail !== undefined && typeof value.detail !== "string" && value.detail !== null) {
			return null;
		}
		if (value.errors !== undefined && !isRecord(value.errors)) {
			return null;
		}
		let errors: Record<string, string[] | string> | undefined;
		if (isRecord(value.errors)) {
			errors = {};
			for (const [key, item] of Object.entries(value.errors)) {
				if (typeof item === "string") {
					errors[key] = item;
					continue;
				}
				if (Array.isArray(item) && item.every((entry) => typeof entry === "string")) {
					errors[key] = item;
					continue;
				}
				return null;
			}
		}
		return {
			type: "error",
			detail: typeof value.detail === "string" ? value.detail : undefined,
			errors,
		};
	}

	if (value.type === "presence") {
		if (
			typeof value.user_id !== "number" ||
			typeof value.is_online !== "boolean" ||
			(typeof value.last_seen_at !== "string" && value.last_seen_at !== null)
		) {
			return null;
		}
		return {
			type: "presence",
			user_id: value.user_id,
			is_online: value.is_online,
			last_seen_at: typeof value.last_seen_at === "string" ? value.last_seen_at : null,
		};
	}

	if (value.type === "typing") {
		if (typeof value.user_id !== "number" || typeof value.is_typing !== "boolean") {
			return null;
		}

		return {
			type: "typing",
			user_id: value.user_id,
			is_typing: value.is_typing,
		};
	}
	return null;
}

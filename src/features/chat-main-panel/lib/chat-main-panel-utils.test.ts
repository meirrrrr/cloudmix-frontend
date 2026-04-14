import { CreateMessageApiError } from "@/features/chat/api/messages";
import type { ChatMessagePayload, PresenceUser } from "@/features/chat/types";
import { ApiError } from "@/shared/lib/api-client";

import {
	CHAT_MESSAGE_MAX_LENGTH,
	mergeMessages,
	sortMessages,
	toComposerErrorMessage,
} from "./chat-main-panel-utils";

const sender: PresenceUser = {
	id: 5,
	username: "alex",
	display_name: "Alex",
	is_online: true,
	last_seen_at: null,
};

function buildMessage(id: number, createdAt: string, body = "message"): ChatMessagePayload {
	return {
		id,
		body,
		created_at: createdAt,
		sender,
	};
}

describe("chat-main-panel-utils", () => {
	it("sortMessages sorts by timestamp then id", () => {
		const input = [
			buildMessage(3, "2026-04-13T11:00:00Z"),
			buildMessage(1, "2026-04-13T10:00:00Z"),
			buildMessage(2, "2026-04-13T10:00:00Z"),
		];

		const sorted = sortMessages(input);
		expect(sorted.map((message) => message.id)).toEqual([1, 2, 3]);
	});

	it("mergeMessages de-duplicates by id and keeps sorted order", () => {
		const older = [buildMessage(1, "2026-04-13T10:00:00Z", "older body")];
		const newer = [
			buildMessage(1, "2026-04-13T10:00:00Z", "newer body"),
			buildMessage(2, "2026-04-13T11:00:00Z"),
		];

		const merged = mergeMessages(older, newer);
		expect(merged).toHaveLength(2);
		expect(merged[0].body).toBe("newer body");
		expect(merged.map((message) => message.id)).toEqual([1, 2]);
	});

	it("maps known composer errors and falls back for unknown ones", () => {
		const notFoundError = new CreateMessageApiError("Not found", 404, {});
		expect(toComposerErrorMessage(notFoundError)).toBe("This conversation is unavailable.");

		const createMessageError = new CreateMessageApiError("Bad request", 400, {});
		expect(toComposerErrorMessage(createMessageError)).toBe("Bad request");

		const apiError = new ApiError("Oops from API", 500, {});
		expect(toComposerErrorMessage(apiError)).toBe("Oops from API");

		expect(toComposerErrorMessage(new Error("random"))).toBe(
			"Unable to send message right now. Please try again.",
		);
	});

	it("exposes the expected message max length", () => {
		expect(CHAT_MESSAGE_MAX_LENGTH).toBe(5000);
	});
});

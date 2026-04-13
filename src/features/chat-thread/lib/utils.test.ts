import type { ChatMessagePayload, PresenceUser } from "@/features/chat/types";

import { getPresenceLabel, toChatMessage } from "./utils";

const sender: PresenceUser = {
	id: 9,
	username: "teammate",
	display_name: "Teammate",
	is_online: false,
	last_seen_at: null,
};

function buildPayload(overrides: Partial<ChatMessagePayload> = {}): ChatMessagePayload {
	return {
		id: 12,
		body: "hello",
		created_at: "2026-04-13T10:00:00Z",
		sender,
		...overrides,
	};
}

describe("chat-thread utils", () => {
	it("returns online presence label for online peer", () => {
		expect(getPresenceLabel(true, null)).toBe("Online");
	});

	it("returns offline when last seen is missing or invalid", () => {
		expect(getPresenceLabel(false, null)).toBe("Offline");
		expect(getPresenceLabel(false, "not-a-date")).toBe("Offline");
	});

	it("maps message to outgoing when sender is current user", () => {
		const payload = buildPayload({
			id: 20,
			sender: { ...sender, id: 99 },
		});

		const mapped = toChatMessage(payload, 99);
		expect(mapped.direction).toBe("outgoing");
		expect(mapped.id).toBe("20");
		expect(mapped.text).toBe("hello");
	});

	it("treats optimistic message ids as outgoing", () => {
		const payload = buildPayload({ id: -1 });
		const mapped = toChatMessage(payload, 1);
		expect(mapped.direction).toBe("outgoing");
	});

	it("maps message to incoming when sender is different user", () => {
		const payload = buildPayload({
			id: 21,
			sender: { ...sender, id: 98 },
		});

		const mapped = toChatMessage(payload, 99);
		expect(mapped.direction).toBe("incoming");
	});
});

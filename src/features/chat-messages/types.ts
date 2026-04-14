import type { ChatMessagePayload } from "../chat/types";

export interface ThreadDividerItem {
	type: "divider";
	key: string;
	label: string;
}

export interface ThreadMessageItem {
	type: "message";
	message: ChatMessagePayload;
}

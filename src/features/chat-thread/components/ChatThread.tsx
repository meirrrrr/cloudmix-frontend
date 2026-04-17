import { useState } from "react";

import { useMeQuery } from "@/features/auth/api/useAuthQuery";
import { ChatHeader } from "@/features/chat-header";
import { ChatMessages } from "@/features/chat-messages";
import { MessageComposer } from "@/features/chat-message-input";
import type { ChatMessagePayload, PresenceState } from "@/features/chat-messages/types";
import type { ComposerSendStatus } from "@/features/chat-main-panel/hooks/useMessageComposer";
import type { Conversation } from "@/features/chat-main-panel/types";
import { ChatLoader } from "@/shared/components/ChatLoader";

import { useConversationThreadAutoScroll } from "../hooks/useConversationThreadAutoScroll";
import { getPresenceLabel } from "../lib/utils";
import { ChatPlaceholder } from "./ChatPlaceholder";
import { ChatError } from "./ChatError";

interface ConversationThreadProps {
	hasChatInRoute: boolean;
	isRouteConversationPending: boolean;
	isRouteConversationError: boolean;
	selectedConversation: Conversation | null;
	presenceByUserId: Record<number, PresenceState>;
	peerIsTyping: boolean;
	sendTyping: (isTyping: boolean) => void;
	messages: ChatMessagePayload[];
	chatError: string | null;
	isHistoryLoading: boolean;
	hasMoreHistory: boolean;
	isLoadingMoreHistory: boolean;
	isPrependingHistory: boolean;
	loadOlderHistory: () => Promise<void> | void;
}

export function ConversationThread({
	hasChatInRoute,
	isRouteConversationPending,
	isRouteConversationError,
	selectedConversation,
	presenceByUserId,
	peerIsTyping,
	sendTyping,
	messages,
	chatError,
	isHistoryLoading,
	hasMoreHistory,
	isLoadingMoreHistory,
	isPrependingHistory,
	loadOlderHistory,
}: ConversationThreadProps) {
	const [sendStatus, setSendStatus] = useState<ComposerSendStatus>({ phase: "idle", messageId: null });
	const { data: me } = useMeQuery();
	const peerData = selectedConversation?.peer ?? null;
	const hasActiveConversation = Boolean(selectedConversation);

	const isResolvingConversation = hasChatInRoute && !hasActiveConversation && isRouteConversationPending;
	const messageListRef = useConversationThreadAutoScroll({
		conversationId: selectedConversation?.id ?? 0,
		messagesCount: messages.length,
		isHistoryLoading,
		isPrependingHistory,
	});

	if (isResolvingConversation) return <ChatLoader />;

	if (hasChatInRoute && !hasActiveConversation && isRouteConversationError) {
		return <ChatError errorMessage="Unable to open this conversation." />;
	}

	if (!hasActiveConversation) return <ChatPlaceholder />;

	const peerPresence: PresenceState | null = peerData
		? (presenceByUserId[peerData.id] ?? {
				is_online: peerData.is_online ?? false,
				last_seen_at: peerData.last_seen_at,
			})
		: null;

	const presenceLabel = getPresenceLabel(
		peerPresence?.is_online ?? false,
		peerPresence?.last_seen_at ?? null,
		peerIsTyping,
	);

	return (
		<div
			className={
				hasChatInRoute ? "flex min-h-0 min-w-0 flex-1" : "hidden md:flex md:min-h-0 md:min-w-0 md:flex-1"
			}
		>
			<section className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-[#F2F1F4]">
				<ChatHeader contactName={peerData?.display_name ?? ""} presenceLabel={presenceLabel} />

				<div ref={messageListRef} className="min-h-0 flex-1 overflow-y-auto border-l border-[#e5e7ee] p-8">
					<ChatMessages
						messages={messages}
						currentUserId={me?.id}
						sendStatus={sendStatus}
						isHistoryLoading={isHistoryLoading}
						hasMoreHistory={hasMoreHistory}
						isLoadingMoreHistory={isLoadingMoreHistory}
						chatError={chatError}
						onLoadOlderHistory={loadOlderHistory}
					/>
				</div>

				<MessageComposer
					selectedConversation={selectedConversation}
					sendTyping={sendTyping}
					disabled={!hasActiveConversation}
					onSendStatusChange={setSendStatus}
				/>
			</section>
		</div>
	);
}

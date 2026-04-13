import { useCallback, useEffect, useMemo, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { useMeQuery } from "@/features/auth/hooks/use-auth-query";
import { useChatWebSocket } from "@/features/chat/hooks/use-chat-websocket";
import type { PresenceState } from "@/features/chat/types";
import { CONVERSATIONS_QUERY_KEY } from "@/features/sidebar/hooks/useConversations";
import { Sidebar } from "@/features/sidebar/components/Sidebar";
import { ConversationThread } from "@/features/chat-thread";
import { useConversationHistory } from "@/features/chat-main-panel/hooks/useConversationHistory";
import { useConversationSelection } from "@/features/chat-main-panel/hooks/useConversationSelection";
import { useMessageComposer } from "@/features/chat-main-panel/hooks/useMessageComposer";
import { mergeMessages } from "../lib/chat-main-panel-utils";

export function ChatMainPanel() {
	const queryClient = useQueryClient();
	const navigate = useNavigate();
	const { chatId } = useParams<{ chatId?: string }>();
	const { data: me } = useMeQuery();
	const { selectedConversation, handleSelectConversation } = useConversationSelection();

	const {
		realtimeMessages,
		presenceByUserId,
		typingByUserId,
		sendTyping,
		lastError: websocketError,
	} = useChatWebSocket({
		conversationId: selectedConversation?.id ?? null,
	});

	const invalidateConversations = useCallback(() => {
		return queryClient.invalidateQueries({ queryKey: CONVERSATIONS_QUERY_KEY });
	}, [queryClient]);

	const {
		historyMessages,
		historyError,
		isHistoryLoading,
		hasMoreHistory,
		isLoadingMoreHistory,
		isPrependingHistory,
		loadOlderHistory,
		refreshHistory,
	} = useConversationHistory({
		selectedConversation,
		onConversationRead: invalidateConversations,
	});

	const { savedMessages, draftMessage, composerError, isSending, handleComposerChange, handleComposerSubmit } =
		useMessageComposer({
			selectedConversation,
			currentUser: me ?? null,
			onMessageCreated: invalidateConversations,
			refreshHistory,
		});

	const threadMessages = useMemo(
		() => mergeMessages(historyMessages, savedMessages, realtimeMessages),
		[historyMessages, realtimeMessages, savedMessages],
	);

	const peerPresence = useMemo(() => {
		if (!selectedConversation) {
			return null;
		}

		const fallbackPresence: PresenceState = {
			is_online: selectedConversation.peer.is_online,
			last_seen_at: selectedConversation.peer.last_seen_at,
		};

		return presenceByUserId[selectedConversation.peer.id] ?? fallbackPresence;
	}, [presenceByUserId, selectedConversation]);

	const chatError = historyError ?? websocketError;

	const hasChatInRoute = Boolean(chatId);
	const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
	const isTypingRef = useRef(false);

	const clearTypingTimeout = useCallback(() => {
		if (typingTimeoutRef.current) {
			clearTimeout(typingTimeoutRef.current);
			typingTimeoutRef.current = null;
		}
	}, []);

	const emitTypingState = useCallback(
		(nextIsTyping: boolean) => {
			if (isTypingRef.current === nextIsTyping) {
				return;
			}

			isTypingRef.current = nextIsTyping;
			sendTyping(nextIsTyping);
		},
		[sendTyping],
	);

	const stopTyping = useCallback(() => {
		clearTypingTimeout();
		emitTypingState(false);
	}, [clearTypingTimeout, emitTypingState]);

	const handleThreadComposerChange = useCallback(
		(value: string) => {
			handleComposerChange(value);
			if (!selectedConversation) {
				return;
			}

			const hasText = value.trim().length > 0;
			if (!hasText) {
				stopTyping();
				return;
			}

			emitTypingState(true);
			clearTypingTimeout();
			typingTimeoutRef.current = setTimeout(() => {
				emitTypingState(false);
				typingTimeoutRef.current = null;
			}, 1200);
		},
		[clearTypingTimeout, emitTypingState, handleComposerChange, selectedConversation, stopTyping],
	);

	const handleThreadComposerSubmit = useCallback(async () => {
		await handleComposerSubmit();
		stopTyping();
	}, [handleComposerSubmit, stopTyping]);

	useEffect(() => {
		return () => {
			stopTyping();
		};
	}, [stopTyping]);

	useEffect(() => {
		stopTyping();
	}, [selectedConversation?.id, stopTyping]);

	const peerIsTyping = useMemo(() => {
		if (!selectedConversation) {
			return false;
		}
		return Boolean(typingByUserId[selectedConversation.peer.id]);
	}, [selectedConversation, typingByUserId]);

	return (
		<div className="flex min-h-0 flex-1 flex-col overflow-hidden md:flex-row">
			<div className={hasChatInRoute ? "hidden md:block" : "block"}>
				<Sidebar
					selectedConversationId={selectedConversation?.id ?? null}
					onSelectConversation={handleSelectConversation}
					presenceByUserId={presenceByUserId}
				/>
			</div>
			<div
				className={
					hasChatInRoute ? "flex min-h-0 min-w-0 flex-1" : "hidden md:flex md:min-h-0 md:min-w-0 md:flex-1"
				}
			>
				<ConversationThread
					hasActiveConversation={Boolean(selectedConversation)}
					onBackToList={
						hasChatInRoute
							? () => {
									navigate("/chat");
								}
							: undefined
					}
					contactName={selectedConversation?.peer.display_name}
					peerIsOnline={peerPresence?.is_online}
					peerIsTyping={peerIsTyping}
					peerLastSeenAt={peerPresence?.last_seen_at ?? null}
					messages={selectedConversation ? threadMessages : undefined}
					currentUserId={me?.id}
					socketError={chatError}
					composerValue={draftMessage}
					composerError={composerError}
					isSending={isSending}
					isHistoryLoading={isHistoryLoading}
					hasMoreHistory={hasMoreHistory}
					isLoadingMoreHistory={isLoadingMoreHistory}
					isPrependingHistory={isPrependingHistory}
					onComposerChange={handleThreadComposerChange}
					onComposerSubmit={handleThreadComposerSubmit}
					onLoadOlderHistory={loadOlderHistory}
				/>
			</div>
		</div>
	);
}

import { UserSearch } from "@/features/search/components/UserSearch";
import type { PresenceState } from "@/features/chat/types";
import type { Conversation } from "../types";
import { useConversations } from "../hooks/useConversations";

interface SidebarProps {
	selectedConversationId: number | null;
	onSelectConversation: (conversation: Conversation) => void;
	presenceByUserId?: Record<number, PresenceState>;
}

export function Sidebar({ selectedConversationId, onSelectConversation, presenceByUserId = {} }: SidebarProps) {
	const { data: conversations, isLoading } = useConversations();
	const formatLastMessageTime = (time: string): string => {
		if (!time) return "";
		const date = new Date(time);
		return date.toLocaleTimeString([], {
			hour: "2-digit",
			minute: "2-digit",
			hour12: false,
		});
	};

	const showMessage = (message: string): string => {
		if (message.length > 50) {
			return message.slice(0, 50) + "...";
		}
		return message;
	};

	return (
		<aside className="w-full border-r border-[#e5e7ee] bg-[#fdfdff] md:w-[510px]">
			<div className="border-b border-[#eceef4] px-6 py-5">
				<h2 className="flex items-baseline gap-1 text-[24px] font-semibold leading-none tracking-tight text-[#232840]">
					<span>Messages ({conversations?.length ?? 0})</span>
				</h2>
				<UserSearch presenceByUserId={presenceByUserId} />
			</div>

			{isLoading ? (
				<div className="px-6 py-8">
					<p className="text-sm font-medium text-[#4a4f68]">Loading...</p>
					<p className="mt-1 text-sm text-[#8d92ac]">Searching for conversations...</p>
				</div>
			) : conversations?.length === 0 ? (
				<div className="px-6 py-8">
					<p className="text-sm font-medium text-[#4a4f68]">No conversations yet</p>
					<p className="mt-1 text-sm text-[#8d92ac]">Search for a user to start chatting.</p>
				</div>
			) : (
				<ul>
					{conversations?.map((conversation) => {
						return (
							<li key={conversation.id} className="border-b border-[#eceef4]">
								<button
									type="button"
									onClick={() => onSelectConversation(conversation)}
									className={`w-full px-6 py-4 h-[90px] text-left transition hover:bg-[#F2F1F4] ${
										selectedConversationId === conversation.id ? "bg-[#F2F1F4]" : ""
									}`}
								>
									<div className="flex items-start justify-between gap-3">
										<div className="flex flex-col items-start justify-between">
											<p className="text-[18px] font-semibold leading-none text-[#252a40]">
												{conversation.peer.display_name}
											</p>
											<p className="mt-2 text-[16px] leading-tight text-[#6f738f]">
												{showMessage(conversation.last_message?.body ?? "No messages yet")}
											</p>
										</div>
										<div className="flex flex-col items-center justify-between">
											{conversation.unread_count > 0 ? (
												<span className="ml-auto inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-[#9564f9] px-1.5 text-xs font-semibold text-white">
													{conversation.unread_count}
												</span>
											) : null}
											<p className="mt-2 text-[14px] font-400 leading-tight text-[#6f738f]">
												{formatLastMessageTime(conversation.last_message?.created_at ?? "")}
											</p>
										</div>
									</div>
								</button>
							</li>
						);
					})}
				</ul>
			)}
		</aside>
	);
}

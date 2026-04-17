import { useNavigate } from "react-router-dom";
import type { Conversation } from "@/features/chat-main-panel/types";
import { formatTimeHHMM } from "@/shared/lib/utils";

type SidebarConversationItemProps = {
	conversation: Conversation;
	isSelected: boolean;
};

function truncateMessage(message: string): string {
	if (message.length > 50) {
		return `${message.slice(0, 50)}...`;
	}
	return message;
}

export function SidebarConversationItem({ conversation, isSelected }: SidebarConversationItemProps) {
	const navigate = useNavigate();
	const handleSelectConversation = (conversationId: number) => {
		navigate(`/chat/${conversationId}`);
	};
	return (
		<li className="border-b border-[#eceef4]">
			<button
				type="button"
				onClick={() => handleSelectConversation(conversation.id)}
				className={`h-[90px] w-full px-6 py-4 text-left transition hover:bg-[#F2F1F4] ${isSelected ? "bg-[#F2F1F4]" : ""}`}
			>
				<div className="flex items-start justify-between gap-3">
					<div className="flex flex-col items-start justify-between">
						<p className="flex items-center gap-2 text-[18px] font-semibold leading-none text-[#252a40]">
							{conversation.peer.display_name}
							{conversation.is_ai_assistant ? (
								<span className="rounded-full bg-[#ece2ff] px-2 py-0.5 text-[11px] font-semibold text-[#6f39e8]">
									AI
								</span>
							) : null}
						</p>
						<p className="mt-2 text-[16px] leading-tight text-[#6f738f]">
							{truncateMessage(conversation.last_message?.body ?? "No messages yet")}
						</p>
					</div>
					<div className="flex flex-col items-center justify-between">
						{conversation.unread_count > 0 ? (
							<span className="ml-auto inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-[#9564f9] px-1.5 text-xs font-semibold text-white">
								{conversation.unread_count}
							</span>
						) : null}
						<p className="mt-2 text-[14px] font-400 leading-tight text-[#6f738f]">
							{formatTimeHHMM(conversation.last_message?.created_at ?? "")}
						</p>
					</div>
				</div>
			</button>
		</li>
	);
}

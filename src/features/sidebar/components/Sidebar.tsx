import { useConversationsQuery } from "@/features/chat-main-panel/api/useConversationsQuery";
import { useInvalidateConversationsOnMessage } from "../hooks/useInvalidateConversationsOnMessage";
import { SidebarConversationItem } from "./SidebarConversationItem";
import { SidebarEmptyState } from "./SidebarEmptyState";
import { SidebarHeader } from "./SidebarHeader";
import { SidebarLoader } from "./SidebarLoader";
import type { Conversation } from "@/features/chat-main-panel/types";

interface SidebarProps {
	selectedConversation: Conversation | null;
}

export function Sidebar({ selectedConversation }: SidebarProps) {
	const { data: conversations = [], isLoading: isConversationsLoading, refetch } = useConversationsQuery();
	useInvalidateConversationsOnMessage({ conversations, refetch });

	return (
		<div className={selectedConversation?.id ? "hidden md:block" : "block"}>
			<div className={selectedConversation?.id ? "hidden md:block" : "block"}>
				<aside className="w-full bg-[#fdfdff] md:w-[360px] lg:w-[420px] xl:w-[510px]">
					<SidebarHeader conversationsCount={conversations.length} />

					{isConversationsLoading && <SidebarLoader />}

					{!isConversationsLoading && conversations.length === 0 && <SidebarEmptyState />}

					{conversations.length > 0 && (
						<ul>
							{conversations.map((conversation) => (
								<SidebarConversationItem
									key={conversation.id}
									conversation={conversation}
									isSelected={selectedConversation?.id === conversation.id}
								/>
							))}
						</ul>
					)}
				</aside>
			</div>
		</div>
	);
}

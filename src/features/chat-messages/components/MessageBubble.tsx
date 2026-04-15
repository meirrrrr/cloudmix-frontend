import type { ChatMessage } from "../types";
import { formatTimeHHMM } from "@/shared/lib/utils";

interface MessageBubbleProps {
	message: ChatMessage;
	animateIn?: boolean;
}

export function MessageBubble({ message }: MessageBubbleProps) {
	const isOutgoing = message.direction === "outgoing";
	const formattedTimestamp = formatTimeHHMM(message.date);

	return (
		<div className={`flex ${isOutgoing ? "justify-end" : "justify-start"}`}>
			<div
				className={`max-w-[78%] break-words rounded-[16px] flex items-end gap-2.5 px-5 py-3 text-[16px] font-[400] transition-all duration-300 ease-out
				${
					isOutgoing
						? "rounded-br-[10px] bg-[#8e5cf8] text-white"
						: "rounded-bl-[10px] border border-[#e7e9f0] bg-white text-[#3b3f56]"
				}`}
			>
				<p className="min-w-0 leading-6">{message.text}</p>
				<span
					className={`shrink-0 translate-y-[2px] text-[11px] leading-none ${
						isOutgoing ? "text-white/75" : "text-[#9aa0b5]"
					}`}
				>
					{formattedTimestamp}
				</span>
			</div>
		</div>
	);
}

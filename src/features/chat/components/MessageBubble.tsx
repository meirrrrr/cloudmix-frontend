import type { ChatMessage } from "../types";

interface MessageBubbleProps {
	message: ChatMessage;
	animateIn?: boolean;
}

export function MessageBubble({ message, animateIn = true }: MessageBubbleProps) {
	const isOutgoing = message.direction === "outgoing";
	const formattedTimestamp = formatMessageTimestamp(message.date);

	return (
		<div className={`flex ${isOutgoing ? "justify-end" : "justify-start"}`}>
			<div
				className={`max-w-[78%] break-words rounded-[16px] flex items-end gap-2.5 px-5 py-3 text-[16px] font-[400] transition-all duration-300 ease-out ${
					animateIn ? "translate-y-0 scale-100 opacity-100" : "translate-y-2 scale-[0.98] opacity-0"
				} ${
					isOutgoing
						? "rounded-br-[10px] bg-[#8e5cf8] text-white"
						: "rounded-bl-[10px] border border-[#e7e9f0] bg-white text-[#3b3f56]"
				}`}
			>
				<p className="min-w-0 leading-6">{message.text}</p>
				<p
					className={`shrink-0 translate-y-[2px] text-[11px] leading-none ${
						isOutgoing ? "text-white/75" : "text-[#9aa0b5]"
					}`}
				>
					{formattedTimestamp}
				</p>
			</div>
		</div>
	);
}

function formatMessageTimestamp(value: string): string {
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) {
		return "";
	}

	return date.toLocaleString([], {
		hour: "2-digit",
		minute: "2-digit",
		hour12: false,
	});
}

interface ChatTypingIndicatorProps {
	isVisible: boolean;
	contactName: string;
}

export function ChatTypingIndicator({ isVisible, contactName }: ChatTypingIndicatorProps) {
	if (!isVisible) {
		return null;
	}

	return (
		<div className="shrink-0 px-6 pb-1 md:px-8">
			<div className="inline-flex items-center gap-2 rounded-[16px] rounded-bl-[10px] border border-[#e7e9f0] bg-white px-4 py-2 text-sm text-[#707690]">
				<span>{contactName} is typing</span>
				<span className="flex items-center gap-1">
					<span className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#a0a6bc]" />
					<span
						className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#a0a6bc]"
						style={{ animationDelay: "120ms" }}
					/>
					<span
						className="h-1.5 w-1.5 animate-bounce rounded-full bg-[#a0a6bc]"
						style={{ animationDelay: "240ms" }}
					/>
				</span>
			</div>
		</div>
	);
}

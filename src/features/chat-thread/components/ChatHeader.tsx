interface ConversationThreadHeaderProps {
	contactName: string;
	presenceLabel: string;
}

/**
 * Displays the selected contact and current presence text.
 */
export function ConversationThreadHeader({ contactName, presenceLabel }: ConversationThreadHeaderProps) {
	return (
		<div className="shrink-0 border-b border-[#e5e7ee] bg-[#fbfbfd] px-6 py-4">
			<p className="text-lg font-semibold text-[#262a41]">{contactName}</p>
			<p className="text-sm text-[#8a8ea9]">{presenceLabel}</p>
		</div>
	);
}

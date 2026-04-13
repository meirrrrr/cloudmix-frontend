interface ChatHeaderProps {
	contactName: string;
	presenceLabel: string;
	onBackToList?: () => void;
}

export function ChatHeader({ contactName, presenceLabel, onBackToList }: ChatHeaderProps) {
	return (
		<div className="shrink-0 h-[90px] border-l border-b border-[#e5e7ee] bg-[#fbfbfd] px-4 py-4 md:px-8">
			<div className="flex items-center gap-2 md:hidden">
				{onBackToList ? (
					<button
						type="button"
						onClick={onBackToList}
						className="rounded-md px-2 py-1 text-sm font-medium text-[#262a41] transition hover:bg-[#f1f2f8]"
					>
						Back
					</button>
				) : null}
				<div className="flex min-w-0 flex-col justify-center gap-1">
					<p className="truncate text-lg font-semibold text-[#262a41]">{contactName}</p>
					<p className="text-sm text-[#8a8ea9]">{presenceLabel}</p>
				</div>
			</div>
			<div className="hidden h-full flex-col justify-center gap-1 md:flex">
				<p className="text-lg font-semibold text-[#262a41]">{contactName}</p>
				<p className="text-sm text-[#8a8ea9]">{presenceLabel}</p>
			</div>
		</div>
	);
}

interface ChatHeaderProps {
	contactName: string;
	presenceLabel: string;
	onBackToList?: () => void;
	peerIsTyping: boolean;
}

function LeftArrowIcon() {
	return (
		<svg
			width="24"
			height="24"
			viewBox="0 0 24 24"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			aria-hidden="true"
		>
			<path
				d="M14.7071 5.29289C15.0976 5.68342 15.0976 6.31658 14.7071 6.70711L9.41421 12L14.7071 17.2929C15.0976 17.6834 15.0976 18.3166 14.7071 18.7071C14.3166 19.0976 13.6834 19.0976 13.2929 18.7071L7.29289 12.7071C6.90237 12.3166 6.90237 11.6834 7.29289 11.2929L13.2929 5.29289C13.6834 4.90237 14.3166 4.90237 14.7071 5.29289Z"
				fill="currentColor"
			/>
		</svg>
	);
}

export function ChatHeader({ contactName, presenceLabel, onBackToList, peerIsTyping }: ChatHeaderProps) {
	return (
		<div className="shrink-0 h-[90px] border-l border-b border-[#e5e7ee] bg-[#fbfbfd] px-4 py-4 md:px-8">
			<div className="flex items-center gap-2 md:hidden">
				<div className="flex min-w-0 flex-col justify-center gap-1">
					<div className="flex items-start gap-2">
						<button
							type="button"
							onClick={() => onBackToList?.()}
							className="inline-flex items-center justify-center rounded p-1 text-[#0D0D0D] transition-colors hover:hover:text-[#262a41]"
							aria-label="Back to chats"
						>
							<LeftArrowIcon />
						</button>
						<div className="flex flex-col gap-1">
							<p className="truncate text-[18px] font-semibold text-[#262a41]">{contactName}</p>
							<p className="text-[16px] text-[#8a8ea9] font-[400]">
								{peerIsTyping ? "typing..." : presenceLabel}
							</p>
						</div>
					</div>
				</div>
			</div>
			<div className="hidden h-full flex-col justify-center gap-1 md:flex">
				<p className="text-lg font-semibold text-[#262a41]">{contactName}</p>
				<p className="text-sm text-[#8a8ea9]">{peerIsTyping ? "typing..." : presenceLabel}</p>
			</div>
		</div>
	);
}

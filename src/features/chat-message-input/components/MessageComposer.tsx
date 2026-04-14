import type { FormEvent } from "react";

interface MessageComposerProps {
	value: string;
	onChange: (nextValue: string) => void;
	onSend: () => void;
	disabled?: boolean;
	isSending?: boolean;
	error?: string | null;
}

function SendIcon() {
	return (
		<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
			<path
				d="M2.58598 1.57953C2.46043 1.51673 2.31978 1.49043 2.18002 1.50362C2.04026 1.51681 1.90701 1.56896 1.79543 1.65413C1.68384 1.73931 1.5984 1.85409 1.54882 1.98542C1.49924 2.11675 1.48752 2.25936 1.51498 2.39703L3.61948 9.67203C3.65872 9.8076 3.73542 9.92935 3.84076 10.0233C3.9461 10.1172 4.07581 10.1795 4.21498 10.203L12.75 11.6325C13.152 11.712 13.152 12.288 12.75 12.3675L4.21498 13.797C4.07581 13.8205 3.9461 13.8828 3.84076 13.9768C3.73542 14.0707 3.65872 14.1925 3.61948 14.328L1.51498 21.603C1.48752 21.7407 1.49924 21.8833 1.54882 22.0146C1.5984 22.146 1.68384 22.2607 1.79543 22.3459C1.90701 22.4311 2.04026 22.4832 2.18002 22.4964C2.31978 22.5096 2.46043 22.4833 2.58598 22.4205L22.086 12.6705C22.2104 12.6082 22.315 12.5124 22.3881 12.394C22.4612 12.2756 22.4999 12.1392 22.4999 12C22.4999 11.8609 22.4612 11.7244 22.3881 11.606C22.315 11.4876 22.2104 11.3919 22.086 11.3295L2.58598 1.57953Z"
				fill="#B4B1B9"
			/>
		</svg>
	);
}

export function MessageComposer({
	value,
	onChange,
	onSend,
	disabled = false,
	isSending = false,
	error = null,
}: MessageComposerProps) {
	function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		if (disabled || isSending) {
			return;
		}
		onSend();
	}

	return (
		<div className="shrink-0">
			<div className="border-t border-l border-[#e7e9f0] bg-[#FFFFFF] px-6 py-3 h-[64px] flex items-center justify-between">
				<form onSubmit={handleSubmit} className="flex flex-1 items-center gap-3">
					<input
						type="text"
						value={value}
						onChange={(event) => {
							onChange(event.target.value);
						}}
						placeholder="Write a message ..."
						disabled={disabled || isSending}
						className="w-full border-none bg-transparent text-[16px] text-[#31354f] placeholder:text-[#180A29] placeholder:opacity-50 outline-none disabled:cursor-not-allowed disabled:opacity-60"
					/>
					<button
						type="submit"
						disabled={disabled || isSending || value.trim().length === 0}
						className="flex h-8 w-8 items-center justify-center text-[#a9adb7] transition hover:text-[#7a808d] disabled:cursor-not-allowed"
						aria-label="Send message"
					>
						<SendIcon />
					</button>
				</form>
				{error ? <p className="mt-1 text-sm text-[#d14343]">{error}</p> : null}
			</div>
		</div>
	);
}

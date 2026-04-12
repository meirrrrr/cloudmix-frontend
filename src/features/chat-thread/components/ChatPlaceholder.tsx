/**
 * Shows the empty state when no chat is selected.
 */
export function ConversationThreadPlaceholder() {
	return (
		<section className="flex min-w-0 flex-1 items-center justify-center bg-[#f7f7fa] px-6">
			<div className="text-center">
				<p className="text-lg font-semibold text-[#262a41]">No chat selected</p>
				<p className="mt-2 text-sm text-[#8a8ea9]">
					Choose a conversation from the sidebar or search for a user to start chatting.
				</p>
			</div>
		</section>
	);
}

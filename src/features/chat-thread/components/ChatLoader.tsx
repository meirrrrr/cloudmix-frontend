export function ChatLoader() {
	return (
		<section className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-[#F2F1F4]">
			<div className="shrink-0 border-b border-[#e7e9f0] bg-white px-5 py-4 md:px-6">
				<p className="text-sm font-medium text-[#8d92ac] h-[90px]">Loading your chat...</p>
			</div>
			<div className="min-h-0 flex-1 space-y-4 overflow-hidden p-8">
				{Array.from({ length: 7 }).map((_, index) => (
					<div
						key={index}
						className={`h-14 animate-pulse rounded-2xl bg-[#e7e9f1] ${
							index % 2 === 0 ? "w-[78%]" : "ml-auto w-[64%]"
						}`}
					/>
				))}
			</div>
			<div className="shrink-0 border-t border-[#e7e9f0] bg-white px-5 py-4 md:px-6">
				<div className="h-12 w-full animate-pulse rounded-2xl bg-[#f1f3f8]" />
			</div>
		</section>
	);
}

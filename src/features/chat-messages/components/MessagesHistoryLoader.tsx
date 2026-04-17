export function MessagesHistoryLoader() {
	return (
		<div className="flex flex-col gap-6" role="status" aria-live="polite" aria-busy="true">
			<div className="flex flex-col items-center gap-3 py-2">
				<span
					className="h-5 w-5 shrink-0 animate-spin rounded-full border-2 border-[#c5cad8] border-t-[#5c6378]"
					aria-hidden
				/>
				<p className="text-center text-sm font-medium text-[#5c6378]">Loading messages…</p>
			</div>
			<div className="space-y-4">
				{Array.from({ length: 6 }).map((_, index) => (
					<div
						key={index}
						className={`h-14 animate-pulse rounded-2xl bg-[#e8eaf1]/90 ${
							index % 2 === 0 ? "w-[78%]" : "ml-auto w-[64%]"
						}`}
					/>
				))}
			</div>
		</div>
	);
}

export function SidebarLoader() {
	return (
		<div className="px-6 py-4">
			<div className="space-y-4">
				{Array.from({ length: 6 }).map((_, index) => (
					<div key={index} className="space-y-2 border-b border-[#f0f1f6] pb-4">
						<div className="h-4 w-32 animate-pulse rounded bg-[#eceef4]" />
						<div className="h-3 w-full animate-pulse rounded bg-[#f1f3f8]" />
					</div>
				))}
			</div>
		</div>
	);
}

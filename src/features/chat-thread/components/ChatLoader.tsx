export function ChatLoader() {
	return (
		<section className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-[#F2F1F4]">
			<div className="shrink-0 h-[90px] border-l border-b border-[#e5e7ee] bg-[#fbfbfd] px-4 py-4 md:px-8">
				<div className="hidden h-full flex-col justify-center gap-2 md:flex">
					<div className="h-6 w-44 rounded-md bg-[#eceef4]" />
					<div className="h-4 w-24 rounded-md bg-[#f1f3f8]" />
				</div>
				<div className="flex items-center gap-2 md:hidden">
					<div className="h-7 w-10 rounded-md bg-[#eceef4]" />
					<div className="flex min-w-0 flex-col justify-center gap-2">
						<div className="h-5 w-32 rounded-md bg-[#eceef4]" />
						<div className="h-3 w-20 rounded-md bg-[#f1f3f8]" />
					</div>
				</div>
			</div>
			<div className="min-h-0 flex-1 overflow-y-auto border-l border-[#e5e7ee] p-8">
				<div className="space-y-4">
					{Array.from({ length: 7 }).map((_, index) => (
						<div
							key={index}
							className={`h-14 rounded-2xl bg-[#f1f3f8] ${
								index % 2 === 0 ? "w-[78%]" : "ml-auto w-[64%]"
							}`}
						/>
					))}
				</div>
			</div>
			<div className="h-[64px] border-t border-l border-[#e7e9f0] bg-[#FFFFFF] px-6 py-3">
				<div className="flex h-full items-center justify-between gap-3">
					<div className="h-6 w-full rounded-md bg-[#f1f3f8]" />
					<div className="h-8 w-8 rounded-full bg-[#eceef4]" />
				</div>
			</div>
		</section>
	);
}

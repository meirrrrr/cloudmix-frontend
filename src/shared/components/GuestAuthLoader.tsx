export function GuestAuthLoader() {
	return (
		<div className="min-h-screen bg-[#f3f4f8] px-4 py-8 sm:px-8">
			<div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-6xl overflow-hidden rounded-3xl border border-[#e7e8ee] bg-white shadow-[0_12px_40px_rgba(39,24,68,0.06)]">
				<aside className="relative hidden w-[42%] flex-col justify-between bg-[#fafbfe] p-10 lg:flex">
					<div>
						<div className="h-4 w-24 rounded-md bg-[#eceef4] animate-pulse" />
						<div className="mt-6 max-w-xs space-y-2.5">
							<div className="h-7 w-full rounded-md bg-[#e4e6ef] animate-pulse" />
							<div className="h-7 w-[92%] rounded-md bg-[#eceef4] animate-pulse" />
							<div className="h-7 w-[68%] rounded-md bg-[#f0f1f6] animate-pulse" />
						</div>
					</div>
					<div className="space-y-4">
						<div className="h-[52px] w-full max-w-[280px] rounded-2xl bg-white shadow-sm animate-pulse" />
						<div className="ml-auto h-[52px] w-full max-w-[220px] rounded-2xl bg-[#e8dcfd]/80 animate-pulse" />
					</div>
					<div className="pointer-events-none absolute -bottom-16 -left-16 h-56 w-56 rounded-full bg-[#8e5cf8]/10 blur-2xl" />
				</aside>
				<section className="flex flex-1 items-center justify-center p-6 sm:p-10">
					<div className="w-full max-w-md">
						<div className="h-9 w-56 max-w-full rounded-md bg-[#e4e6ef] animate-pulse" />
						<div className="mt-2 h-4 w-full max-w-sm rounded-md bg-[#eceef4] animate-pulse" />
						<div className="mt-1.5 h-4 w-[88%] max-w-xs rounded-md bg-[#f0f1f6] animate-pulse" />
						<div className="mt-8 space-y-4">
							<div className="h-11 w-full rounded-xl border border-[#eceef4] bg-[#fbfbfd] animate-pulse" />
							<div className="h-11 w-full rounded-xl border border-[#eceef4] bg-[#fbfbfd] animate-pulse" />
							<div className="h-10 w-full rounded-xl bg-[#e8dcfd]/60 animate-pulse" />
						</div>
					</div>
				</section>
			</div>
		</div>
	);
}

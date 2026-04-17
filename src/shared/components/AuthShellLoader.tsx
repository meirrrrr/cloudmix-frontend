import logo from "@/assets/logo.svg";
import { SidebarLoader } from "@/features/sidebar/components/SidebarLoader";

export function AuthShellLoader() {
	return (
		<div className="chat-page-transition flex h-screen flex-col overflow-hidden">
			<div className="flex min-h-0 w-full flex-1 flex-col overflow-hidden bg-white">
				<header className="flex shrink-0 items-center justify-between border-b border-[#e5e7ee] bg-[#fbfbfd] px-6 py-4">
					<div className="flex items-center gap-2.5">
						<img src={logo} alt="logo" />
					</div>
					<div className="flex flex-col items-end gap-2 text-right">
						<div className="h-[22px] w-[7.5rem] max-w-[40vw] rounded-md bg-[#eceef4] animate-pulse" />
						<div className="h-4 w-14 rounded-md bg-[#f1f3f8] animate-pulse" />
					</div>
				</header>

				<div className="flex min-h-0 flex-1 flex-col overflow-hidden md:flex-row">
					<div className="block min-h-0">
						<div className="block h-full min-h-0">
							<aside className="flex h-full min-h-0 w-full flex-col bg-[#fdfdff] md:w-[360px] lg:w-[420px] xl:w-[510px]">
								<div className="shrink-0 border-b border-[#eceef4] px-6 py-5">
									<div className="h-8 w-40 max-w-[85%] rounded-md bg-[#eceef4] animate-pulse" />
									<div className="mt-4">
										<div className="flex items-center gap-2 rounded-xl border border-[#e4e7f2] bg-white px-3 py-2">
											<div className="h-4 w-4 shrink-0 rounded-full bg-[#f1f3f8] animate-pulse" />
											<div className="h-4 min-w-0 flex-1 rounded-md bg-[#f5f6fb] animate-pulse" />
										</div>
									</div>
								</div>
								<div className="min-h-0 flex-1 overflow-y-auto">
									<SidebarLoader />
								</div>
							</aside>
						</div>
					</div>

					<div className="hidden min-h-0 min-w-0 md:flex md:flex-1">
						<section className="flex min-h-0 min-w-0 flex-1 items-center justify-center bg-[#f7f7fa] px-6">
							<div className="w-full max-w-md space-y-3">
								<div className="mx-auto h-7 w-52 max-w-full rounded-md bg-[#e4e6ef] animate-pulse" />
								<div className="mx-auto h-4 w-full max-w-sm rounded-md bg-[#eceef4] animate-pulse" />
								<div className="mx-auto h-4 w-[88%] max-w-xs rounded-md bg-[#f0f1f6] animate-pulse" />
							</div>
						</section>
					</div>
				</div>
			</div>
		</div>
	);
}

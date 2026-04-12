import type { ReactNode } from "react";

interface AuthShellProps {
	title: string;
	subtitle: string;
	children: ReactNode;
}

export function AuthShell({ title, subtitle, children }: AuthShellProps) {
	return (
		<div className="min-h-screen bg-[#f3f4f8] px-4 py-8 sm:px-8">
			<div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-6xl overflow-hidden rounded-3xl border border-[#e7e8ee] bg-white shadow-[0_12px_40px_rgba(39,24,68,0.06)]">
				<aside className="relative hidden w-[42%] flex-col justify-between bg-[#fafbfe] p-10 lg:flex">
					<div>
						<p className="text-sm font-semibold tracking-wide text-[#6b6c7a]">CloudMix</p>
						<h2 className="mt-6 max-w-xs text-3xl font-semibold leading-tight text-[#202134]">
							Chat with your team in one clean workspace.
						</h2>
					</div>
					<div className="space-y-4">
						<div className="w-fit rounded-2xl bg-white px-4 py-3 text-sm text-[#4c4e63] shadow-sm">
							Hi team, what are we shipping today?
						</div>
						<div className="ml-auto w-fit rounded-2xl bg-[#8e5cf8] px-4 py-3 text-sm text-white shadow-sm">
							Auth pages are ready to test.
						</div>
					</div>
					<div className="pointer-events-none absolute -bottom-16 -left-16 h-56 w-56 rounded-full bg-[#8e5cf8]/10 blur-2xl" />
				</aside>
				<section className="flex flex-1 items-center justify-center p-6 sm:p-10">
					<div className="w-full max-w-md">
						<h1 className="text-3xl font-semibold text-[#202134]">{title}</h1>
						<p className="mt-2 text-sm text-[#6b6c7a]">{subtitle}</p>
						<div className="mt-8">{children}</div>
					</div>
				</section>
			</div>
		</div>
	);
}

import { Link } from "react-router-dom";

export default function WelcomePage() {
	return (
		<div className="relative min-h-screen overflow-hidden bg-[#f6f7ff] px-6 py-10">
			<div className="pointer-events-none absolute left-1/2 top-0 h-80 w-80 -translate-x-1/2 rounded-full bg-[#8e5cf8]/20 blur-3xl" />
			<div className="mx-auto flex min-h-[calc(100vh-5rem)] w-full max-w-3xl items-center">
				<div className="w-full rounded-3xl border border-[#e4e7f4] bg-white/90 p-8 shadow-[0_24px_70px_rgba(31,20,58,0.10)] backdrop-blur md:p-12">
					<p className="inline-flex rounded-full border border-[#d6daf0] bg-[#f9faff] px-3 py-1 text-xs font-medium tracking-wide text-[#62689a]">
						Built for instant conversations
					</p>
					<h1 className="mt-5 text-4xl font-semibold leading-tight text-[#1d2340] md:text-5xl">
						Welcome to CloudMix Chat
					</h1>
					<p className="mt-4 max-w-2xl text-base text-[#5d6281] md:text-lg">
						A simple, beautiful space where teams and friends connect in real time, share ideas, and keep
						every conversation in one place.
					</p>
					<div className="mt-8 flex flex-wrap gap-3">
						<span className="rounded-xl bg-[#f2f4ff] px-3 py-2 text-sm text-[#39407a]">Fast messaging</span>
						<span className="rounded-xl bg-[#f2f4ff] px-3 py-2 text-sm text-[#39407a]">Secure access</span>
						<span className="rounded-xl bg-[#f2f4ff] px-3 py-2 text-sm text-[#39407a]">
							Clean interface
						</span>
					</div>
					<div className="mt-9 flex flex-wrap gap-3">
						<Link
							className="rounded-xl bg-[#8e5cf8] px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-[#7f4df1]"
							to="/login"
						>
							Start chatting
						</Link>
						<Link
							className="rounded-xl border border-[#d7d9e3] px-6 py-2.5 text-sm font-semibold text-[#32344a] transition hover:bg-[#f5f6fb]"
							to="/register"
						>
							Create account
						</Link>
					</div>
				</div>
			</div>
		</div>
	);
}

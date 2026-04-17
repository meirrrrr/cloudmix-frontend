export function ChatError({ errorMessage }: { errorMessage: string }) {
	return (
		<div className="hidden md:flex md:min-h-0 md:min-w-0 md:flex-1">
			<section className="flex min-w-0 flex-1 items-center justify-center bg-[#f7f7fa] px-6">
				<p className="text-center text-sm font-medium text-[#d14343]">{errorMessage}</p>
			</section>
		</div>
	);
}

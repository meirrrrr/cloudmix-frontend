export function DateDivider({ label }: { label: string }) {
	return (
		<div className="flex items-center gap-4 text-xs text-[#9a9eb6]">
			<div className="h-px flex-1 bg-[#dfe2ec]" />
			<span className="text-[16px] font-[400] text-[#180A29] opacity-50">{label}</span>
			<div className="h-px flex-1 bg-[#dfe2ec]" />
		</div>
	);
}

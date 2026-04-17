import { UserSearch } from "@/features/search/components/UserSearch";

type SidebarHeaderProps = {
	conversationsCount: number;
};

export function SidebarHeader({ conversationsCount }: SidebarHeaderProps) {
	return (
		<div className="border-b border-[#eceef4] px-6 py-5">
			<h2 className="flex items-baseline gap-1 text-[24px] font-semibold leading-none tracking-tight text-[#232840]">
				Messages ({conversationsCount})
			</h2>
			<UserSearch />
		</div>
	);
}

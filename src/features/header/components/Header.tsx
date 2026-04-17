import { useNavigate } from "react-router-dom";
import { useLogoutMutation, useMeQuery } from "@/features/auth/api/useAuthQuery";
import logo from "@/assets/logo.svg";

export function Header() {
	const navigate = useNavigate();
	const { data: user } = useMeQuery();
	const logoutMutation = useLogoutMutation();

	const userLabel = user?.display_name || user?.username || "User";

	async function handleLogout() {
		await logoutMutation.mutateAsync();
		navigate("/login", { replace: true });
	}

	return (
		<header className="flex items-center justify-between border-b border-[#e5e7ee] bg-[#fbfbfd] px-6 py-4">
			<div className="flex items-center gap-2.5">
				<img src={logo} alt="logo" />
			</div>

			<div className="text-right">
				<p className="text-[18px] font-[500] text-[#180A29]">{userLabel}</p>
				<button
					type="button"
					className="text-[16px] text-[#180A29] opacity-50 transition hover:text-[#636780]"
					onClick={handleLogout}
					disabled={logoutMutation.isPending}
				>
					{logoutMutation.isPending ? "Logging out..." : "Logout"}
				</button>
			</div>
		</header>
	);
}

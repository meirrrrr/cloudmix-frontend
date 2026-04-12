import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useLoginMutation } from "@/features/auth/hooks/use-auth-query";
import { ApiError } from "@/shared/lib/api-client";

interface LoginFormState {
	username: string;
	password: string;
}

const INITIAL_FORM_STATE: LoginFormState = {
	username: "",
	password: "",
};

export function LoginForm() {
	const navigate = useNavigate();
	const loginMutation = useLoginMutation();
	const [formState, setFormState] =
		useState<LoginFormState>(INITIAL_FORM_STATE);
	const [error, setError] = useState<string>("");

	async function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setError("");
		try {
			await loginMutation.mutateAsync(formState);
			navigate("/chat");
		} catch (caughtError) {
			if (caughtError instanceof ApiError) {
				setError(caughtError.message);
			} else {
				setError("Unable to sign in right now. Please try again.");
			}
		}
	}

	return (
		<form className="space-y-4" onSubmit={handleSubmit}>
			<label className="block">
				<span className="mb-2 block text-sm font-medium text-[#32344a]">
					Username
				</span>
				<input
					className="h-11 w-full rounded-xl border border-[#d7d9e3] bg-white px-4 text-sm text-[#1f2136] outline-none transition focus:border-[#8e5cf8] focus:ring-2 focus:ring-[#8e5cf8]/20"
					type="text"
					autoComplete="username"
					value={formState.username}
					onChange={(event) =>
						setFormState((current) => ({
							...current,
							username: event.target.value,
						}))
					}
					required
				/>
			</label>

			<label className="block">
				<span className="mb-2 block text-sm font-medium text-[#32344a]">
					Password
				</span>
				<input
					className="h-11 w-full rounded-xl border border-[#d7d9e3] bg-white px-4 text-sm text-[#1f2136] outline-none transition focus:border-[#8e5cf8] focus:ring-2 focus:ring-[#8e5cf8]/20"
					type="password"
					autoComplete="current-password"
					value={formState.password}
					onChange={(event) =>
						setFormState((current) => ({
							...current,
							password: event.target.value,
						}))
					}
					required
				/>
			</label>

			{error ? (
				<div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
					{error}
				</div>
			) : null}

			<button
				className="mt-2 h-11 w-full rounded-xl bg-[#8e5cf8] text-sm font-semibold text-white transition hover:bg-[#7f4df1] disabled:cursor-not-allowed disabled:opacity-70"
				type="submit"
				disabled={loginMutation.isPending}
			>
				{loginMutation.isPending ? "Signing in..." : "Sign in"}
			</button>

			<p className="pt-2 text-center text-sm text-[#62657b]">
				No account yet?{" "}
				<Link
					className="font-semibold text-[#7f4df1] hover:underline"
					to="/register"
				>
					Create one
				</Link>
			</p>
		</form>
	);
}

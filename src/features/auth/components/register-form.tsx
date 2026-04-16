import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useRegisterMutation } from "@/features/auth/api/useAuthQuery";
import { ApiError } from "@/shared/lib/api-client";
import { createFieldUpdater, extractErrorMessage } from "../lib/utils";

interface RegisterFormState {
	display_name: string;
	username: string;
	password: string;
}

const INITIAL_FORM_STATE: RegisterFormState = {
	display_name: "",
	username: "",
	password: "",
};

export function RegisterForm() {
	const navigate = useNavigate();
	const registerMutation = useRegisterMutation();

	const [formState, setFormState] = useState<RegisterFormState>(INITIAL_FORM_STATE);
	const [error, setError] = useState("");
	const updateField = createFieldUpdater(setFormState);

	async function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setError("");

		if (formState.password.length < 8) {
			setError("Password must be at least 8 characters.");
			return;
		}

		try {
			await registerMutation.mutateAsync(formState);
			navigate("/chat");
		} catch (caughtError) {
			if (caughtError instanceof ApiError) {
				setError(extractErrorMessage(caughtError.data) ?? caughtError.message);
			} else {
				setError("Unable to register right now. Please try again.");
			}
		}
	}

	return (
		<form className="space-y-4" onSubmit={handleSubmit}>
			<label className="block">
				<span className="mb-2 block text-sm font-medium text-[#32344a]">Display name</span>
				<input
					className="h-11 w-full rounded-xl border border-[#d7d9e3] bg-white px-4 text-sm text-[#1f2136] outline-none transition focus:border-[#8e5cf8] focus:ring-2 focus:ring-[#8e5cf8]/20"
					type="text"
					value={formState.display_name}
					onChange={(event) => updateField("display_name", event.target.value)}
					required
				/>
			</label>

			<label className="block">
				<span className="mb-2 block text-sm font-medium text-[#32344a]">Username</span>
				<input
					className="h-11 w-full rounded-xl border border-[#d7d9e3] bg-white px-4 text-sm text-[#1f2136] outline-none transition focus:border-[#8e5cf8] focus:ring-2 focus:ring-[#8e5cf8]/20"
					type="text"
					autoComplete="username"
					value={formState.username}
					onChange={(event) => updateField("username", event.target.value)}
					required
				/>
			</label>

			<label className="block">
				<span className="mb-2 block text-sm font-medium text-[#32344a]">Password</span>
				<input
					className="h-11 w-full rounded-xl border border-[#d7d9e3] bg-white px-4 text-sm text-[#1f2136] outline-none transition focus:border-[#8e5cf8] focus:ring-2 focus:ring-[#8e5cf8]/20"
					type="password"
					autoComplete="new-password"
					minLength={8}
					value={formState.password}
					onChange={(event) => updateField("password", event.target.value)}
					required
				/>
			</label>

			{error ? (
				<div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>
			) : null}

			<button
				className="mt-2 h-11 w-full rounded-xl bg-[#8e5cf8] text-sm font-semibold text-white transition hover:bg-[#7f4df1] disabled:cursor-not-allowed disabled:opacity-70"
				type="submit"
				disabled={registerMutation.isPending}
			>
				{registerMutation.isPending ? "Creating account..." : "Create account"}
			</button>

			<p className="pt-2 text-center text-sm text-[#62657b]">
				Already have an account?{" "}
				<Link className="font-semibold text-[#7f4df1] hover:underline" to="/login">
					Sign in
				</Link>
			</p>
		</form>
	);
}

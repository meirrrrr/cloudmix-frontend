import { create } from "zustand";

import { getMe, login, register, logout } from "@/features/auth/api/auth-api";
import type {
	AuthUser,
	LoginRequest,
	RegisterRequest,
} from "@/features/auth/types";

interface AuthState {
	user: AuthUser | null;
	isBootstrapping: boolean;
	hasBootstrapped: boolean;
	bootstrapSession: () => Promise<void>;
	loginUser: (payload: LoginRequest) => Promise<AuthUser>;
	registerUser: (payload: RegisterRequest) => Promise<AuthUser>;
	clearSession: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
	user: null,
	isBootstrapping: false,
	hasBootstrapped: false,
	bootstrapSession: async () => {
		if (get().isBootstrapping) {
			return;
		}
		set({ isBootstrapping: true });
		try {
			const me = await getMe();
			set({ user: me, hasBootstrapped: true });
		} catch {
			set({ user: null, hasBootstrapped: true });
		} finally {
			set({ isBootstrapping: false });
		}
	},
	loginUser: async (payload) => {
		const user = await login(payload);
		set({ user, hasBootstrapped: true });
		return user;
	},
	registerUser: async (payload) => {
		const user = await register(payload);
		set({ user, hasBootstrapped: true });
		return user;
	},
	clearSession: () => {
		set({ user: null, hasBootstrapped: true, isBootstrapping: false });
	},
	logoutUser: async () => {
		await logout();
		set({ user: null, hasBootstrapped: true, isBootstrapping: false });
	},
}));

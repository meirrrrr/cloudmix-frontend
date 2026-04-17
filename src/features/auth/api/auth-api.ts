import { apiRequest } from "@/shared/lib/api-client";
import { clearAuthTokens, getRefreshToken, setAuthTokens } from "@/shared/lib/jwt-storage";

import type { ApiDetailResponse, AuthUser, LoginRequest, RegisterRequest } from "@/features/auth/types";

const AUTH_BASE_PATH = "/api/accounts/auth";
const USERS_BASE_PATH = "/api/accounts/users";

type AuthPayload = AuthUser & { access?: string; refresh?: string };

function takeTokensFromPayload(data: AuthPayload): AuthUser {
	const { access, refresh, ...user } = data;
	if (typeof access === "string" && access.trim() && typeof refresh === "string" && refresh.trim()) {
		setAuthTokens(access, refresh);
	}
	return user;
}

export function register(payload: RegisterRequest): Promise<AuthUser> {
	return apiRequest<AuthPayload>(`${AUTH_BASE_PATH}/register/`, {
		method: "POST",
		body: JSON.parse(JSON.stringify(payload)),
	}).then(takeTokensFromPayload);
}

export function login(payload: LoginRequest): Promise<AuthUser> {
	return apiRequest<AuthPayload>(`${AUTH_BASE_PATH}/login/`, {
		method: "POST",
		body: JSON.parse(JSON.stringify(payload)),
	}).then(takeTokensFromPayload);
}

export function logout(): Promise<void> {
	const refresh = getRefreshToken();
	return apiRequest<void>(`${AUTH_BASE_PATH}/logout/`, {
		method: "POST",
		body: refresh ? { refresh } : {},
	}).finally(() => {
		clearAuthTokens();
	});
}

export function refreshToken(): Promise<ApiDetailResponse> {
	return apiRequest<ApiDetailResponse>(`${AUTH_BASE_PATH}/token/refresh/`, {
		method: "POST",
		body: { refresh: getRefreshToken() ?? "" },
	});
}

export function getMe(): Promise<AuthUser> {
	return apiRequest<AuthUser>(`${USERS_BASE_PATH}/me/`);
}

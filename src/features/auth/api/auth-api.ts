import { apiRequest } from "@/shared/lib/api-client";

import type { ApiDetailResponse, AuthUser, LoginRequest, RegisterRequest } from "@/features/auth/types";

const AUTH_BASE_PATH = "/api/accounts/auth";
const USERS_BASE_PATH = "/api/accounts/users";

export function register(payload: RegisterRequest): Promise<AuthUser> {
	return apiRequest<AuthUser>(`${AUTH_BASE_PATH}/register/`, {
		method: "POST",
		body: JSON.parse(JSON.stringify(payload)),
	});
}

export function login(payload: LoginRequest): Promise<AuthUser> {
	return apiRequest<AuthUser>(`${AUTH_BASE_PATH}/login/`, {
		method: "POST",
		body: JSON.parse(JSON.stringify(payload)),
	});
}

export function logout(): Promise<void> {
	return apiRequest<void>(`${AUTH_BASE_PATH}/logout/`, {
		method: "POST",
	});
}

export function refreshToken(): Promise<ApiDetailResponse> {
	return apiRequest<ApiDetailResponse>(`${AUTH_BASE_PATH}/token/refresh/`, {
		method: "POST",
	});
}

export function getMe(): Promise<AuthUser> {
	return apiRequest<AuthUser>(`${USERS_BASE_PATH}/me/`);
}

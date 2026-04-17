import { env } from "@/shared/lib/env";
import { clearAuthTokens, getAccessToken, getRefreshToken, setAuthTokens } from "@/shared/lib/jwt-storage";

type JsonValue = Record<string, unknown> | Array<unknown> | string | number | boolean | null;

interface ApiRequestOptions extends Omit<RequestInit, "body"> {
	body?: JsonValue;
	params?: Record<string, string>;
}

interface ApiErrorShape {
	detail?: string;
	message?: string;
}

export class ApiError extends Error {
	public readonly status: number;
	public readonly data: unknown;

	constructor(message: string, status: number, data: unknown) {
		super(message);
		this.name = "ApiError";
		this.status = status;
		this.data = data;
	}
}

function joinUrl(baseUrl: string, path: string, params?: Record<string, string>): string {
	if (path.startsWith("http")) {
		return path;
	}
	const normalizedBase = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
	const normalizedPath = path.startsWith("/") ? path : `/${path}`;

	if (params && Object.keys(params).length > 0) {
		const queryString = new URLSearchParams(params).toString();
		return `${normalizedBase}${normalizedPath}?${queryString}`;
	}

	return `${normalizedBase}${normalizedPath}`;
}

async function parseResponseBody(response: Response): Promise<unknown> {
	const contentType = response.headers.get("content-type") ?? "";
	if (!contentType.includes("application/json")) {
		return null;
	}
	return response.json();
}

async function refreshAccessToken(): Promise<boolean> {
	const refresh = getRefreshToken();
	if (!refresh) {
		return false;
	}
	const refreshUrl = joinUrl(env.apiBaseUrl, "/api/accounts/auth/token/refresh/");
	const response = await fetch(refreshUrl, {
		method: "POST",
		credentials: "omit",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ refresh }),
	});
	if (!response.ok) {
		clearAuthTokens();
		return false;
	}
	const data = (await parseResponseBody(response)) as { access?: string; refresh?: string } | null;
	if (data && typeof data.access === "string" && data.access.trim()) {
		const nextRefresh = typeof data.refresh === "string" && data.refresh.trim() ? data.refresh : refresh;
		setAuthTokens(data.access, nextRefresh);
		return true;
	}
	clearAuthTokens();
	return false;
}

function toApiErrorMessage(status: number, data: unknown): string {
	if (data && typeof data === "object") {
		const candidate = data as ApiErrorShape;
		if (candidate.detail) {
			return candidate.detail;
		}
		if (candidate.message) {
			return candidate.message;
		}
	}
	return `Request failed with status ${status}.`;
}

function buildRequestInit(path: string, options: ApiRequestOptions): { url: string; init: RequestInit } {
	const { body, headers, params, ...rest } = options;
	const url = joinUrl(env.apiBaseUrl, path, params);
	const bearer = getAccessToken();
	const init: RequestInit = {
		...rest,
		headers: {
			"Content-Type": "application/json",
			...(bearer ? { Authorization: `Bearer ${bearer}` } : {}),
			...headers,
		},
		credentials: "omit",
		body: body === undefined ? undefined : JSON.stringify(body),
	};
	return { url, init };
}

export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
	const { url, init } = buildRequestInit(path, options);

	let response = await fetch(url, init);

	const isRefreshRequest = path.includes("/api/accounts/auth/token/refresh/");
	if (response.status === 401 && !isRefreshRequest) {
		const didRefresh = await refreshAccessToken();
		if (didRefresh) {
			const retry = buildRequestInit(path, options);
			response = await fetch(retry.url, retry.init);
		}
	}

	const data = await parseResponseBody(response);
	if (!response.ok) {
		throw new ApiError(toApiErrorMessage(response.status, data), response.status, data);
	}
	return data as T;
}

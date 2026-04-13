import { env } from "@/shared/lib/env";

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
	const refreshUrl = joinUrl(env.apiBaseUrl, "/api/accounts/auth/token/refresh/");
	const response = await fetch(refreshUrl, {
		method: "POST",
		credentials: "include",
	});
	return response.ok;
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

export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
	const { body, headers, params, ...rest } = options;

	const url = joinUrl(env.apiBaseUrl, path, params);

	const requestConfig: RequestInit = {
		...rest,
		headers: {
			"Content-Type": "application/json",
			...headers,
		},
		credentials: "include",
		body: body === undefined ? undefined : JSON.stringify(body),
	};

	let response = await fetch(url, requestConfig);

	const isRefreshRequest = path.includes("/api/accounts/auth/token/refresh/");
	if (response.status === 401 && !isRefreshRequest) {
		const didRefresh = await refreshAccessToken();
		if (didRefresh) {
			response = await fetch(url, requestConfig);
		}
	}

	const data = await parseResponseBody(response);
	if (!response.ok) {
		throw new ApiError(toApiErrorMessage(response.status, data), response.status, data);
	}
	return data as T;
}

const ACCESS_KEY = "chat_access_token";
const REFRESH_KEY = "chat_refresh_token";

export function getAccessToken(): string | null {
	try {
		return localStorage.getItem(ACCESS_KEY)?.trim() || null;
	} catch {
		return null;
	}
}

export function getRefreshToken(): string | null {
	try {
		return localStorage.getItem(REFRESH_KEY)?.trim() || null;
	} catch {
		return null;
	}
}

export function setAuthTokens(access: string | null, refresh: string | null): void {
	try {
		if (access?.trim()) {
			localStorage.setItem(ACCESS_KEY, access.trim());
		} else {
			localStorage.removeItem(ACCESS_KEY);
		}
		if (refresh?.trim()) {
			localStorage.setItem(REFRESH_KEY, refresh.trim());
		} else {
			localStorage.removeItem(REFRESH_KEY);
		}
	} catch {
		/* private mode / quota */
	}
}

export function clearAuthTokens(): void {
	try {
		localStorage.removeItem(ACCESS_KEY);
		localStorage.removeItem(REFRESH_KEY);
	} catch {
		/* ignore */
	}
}

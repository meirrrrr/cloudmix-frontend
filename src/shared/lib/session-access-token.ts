let sessionAccessToken: string | null = null;

export function setSessionAccessToken(token: string | null): void {
	sessionAccessToken = token?.trim() || null;
}

export function getSessionAccessToken(): string | null {
	return sessionAccessToken;
}

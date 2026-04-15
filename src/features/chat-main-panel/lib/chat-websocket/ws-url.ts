export function toWsBaseUrl(apiBaseUrl: string): string {
	const trimmedUrl = apiBaseUrl.trim().replace(/\/+$/, "");
	if (trimmedUrl.startsWith("https://")) {
		return `wss://${trimmedUrl.slice("https://".length)}`;
	}
	if (trimmedUrl.startsWith("http://")) {
		return `ws://${trimmedUrl.slice("http://".length)}`;
	}
	return trimmedUrl;
}

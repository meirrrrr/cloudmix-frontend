const FALLBACK_API_BASE_URL = "https://cloudmix-backend.onrender.com";

export const env = {
	apiBaseUrl: (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim() || FALLBACK_API_BASE_URL,
};

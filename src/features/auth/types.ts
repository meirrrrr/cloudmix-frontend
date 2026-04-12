export interface AuthUser {
	id: number;
	username: string;
	display_name: string;
	is_online: boolean;
	last_seen_at: string | null;
}

export interface LoginRequest {
	username: string;
	password: string;
}

export interface RegisterRequest extends LoginRequest {
	display_name: string;
}

export interface ApiDetailResponse {
	detail: string;
}

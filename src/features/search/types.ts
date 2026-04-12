export interface SearchUser {
	id: number;
	username: string;
	display_name: string;
	is_online: boolean;
	last_seen_at: string | null;
}

export interface ConversationRequest {
	user_id: number;
}

export interface ConversationResponse {
	id: number;
	updated_at: string;
	peer: {
		id: number;
		username: string;
		display_name: string;
		is_online: boolean;
		last_seen_at: string | null;
	};
}

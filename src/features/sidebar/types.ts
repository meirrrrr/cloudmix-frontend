export type Conversation = {
	id: number;
	updated_at: string;
	unread_count: number;
	last_message: {
		id: number;
		body: string;
		created_at: string;
		sender: {
			id: number;
			username: string;
			display_name: string;
			is_online: boolean;
			last_seen_at: string | null;
		};
	} | null;
	peer: {
		id: number;
		username: string;
		display_name: string;
		is_online: boolean;
		last_seen_at: string | null;
	};
};

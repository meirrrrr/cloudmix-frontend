import { useState, type ChangeEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import { useCreateConversationMutation, useSearchQuery } from "../api/useSearchQuery";

const DEBOUNCE_DELAY = 1000;

export function UserSearch() {
	const navigate = useNavigate();
	const [query, setQuery] = useState("");
	const debouncedQuery = useDebouncedValue(query, DEBOUNCE_DELAY);
	const normalizedQuery = query.trim();
	const normalizedDebouncedQuery = debouncedQuery.trim();
	const isDebouncing = normalizedQuery !== normalizedDebouncedQuery;

	const { data: searchUsers = [], isFetching } = useSearchQuery(normalizedDebouncedQuery);
	const { mutate: createConversationMutation, isPending: isCreatingConversation } = useCreateConversationMutation();
	const isSearching = isDebouncing || isFetching;

	const handleQueryChange = (event: ChangeEvent<HTMLInputElement>) => {
		setQuery(event.target.value);
	};

	const handleSelectUser = (userId: number) => {
		createConversationMutation(userId, {
			onSuccess: (conversation) => {
				setQuery("");
				navigate(`/chat/${conversation.id}`);
			},
		});
	};

	return (
		<div className="mt-4 space-y-2">
			<label className="sr-only" htmlFor="user-search-input">
				Search users by name
			</label>
			<div className="flex items-center gap-2 rounded-xl border border-[#e4e7f2] bg-white px-3 py-2">
				<svg
					aria-hidden
					viewBox="0 0 24 24"
					className="h-4 w-4 text-[#9ca1bb]"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
				>
					<circle cx="11" cy="11" r="7" />
					<path d="m20 20-3-3" />
				</svg>
				<input
					id="user-search-input"
					value={query}
					onChange={handleQueryChange}
					placeholder="Search users by name"
					className="w-full border-none bg-transparent text-sm text-[#2e334f] placeholder:text-[#9ca1bb] outline-none"
					autoComplete="off"
				/>
			</div>

			{normalizedQuery.length > 0 && (
				<div className="rounded-xl border border-[#e9ebf4] bg-white">
					{isSearching ? (
						<p className="px-3 py-2 text-sm text-[#8f94af]">Searching...</p>
					) : searchUsers.length > 0 ? (
						<ul className="max-h-[300px] overflow-y-auto">
							{searchUsers.map((user) => {
								return (
									<li key={user.id} className="border-b border-[#f1f2f8] last:border-b-0">
										<button
											type="button"
											className="flex w-full items-center justify-between px-3 py-2 text-left transition hover:bg-[#f8f8fe]"
											onClick={() => {
												handleSelectUser(user.id);
											}}
											disabled={isCreatingConversation}
										>
											<div className="flex flex-1 items-center justify-between">
												<p className="text-sm font-medium text-[#2a2f46]">
													{user.display_name}
												</p>
												<p className="text-xs text-[#8f94af]">@{user.username}</p>
											</div>
										</button>
									</li>
								);
							})}
						</ul>
					) : (
						<p className="px-3 py-2 text-sm text-[#8f94af]">No users found.</p>
					)}
				</div>
			)}
		</div>
	);
}

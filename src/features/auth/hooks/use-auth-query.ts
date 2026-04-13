import {
	useMutation,
	useQuery,
	useQueryClient,
	type UseMutationResult,
	type UseQueryResult,
} from "@tanstack/react-query";

import { getMe, login, logout, register } from "@/features/auth/api/auth-api";
import type { AuthUser, LoginRequest, RegisterRequest } from "@/features/auth/types";

const AUTH_QUERY_KEYS = {
	me: ["auth", "me"] as const,
};

export function useMeQuery(): UseQueryResult<AuthUser> {
	return useQuery({
		queryKey: AUTH_QUERY_KEYS.me,
		queryFn: getMe,
		retry: false,
	});
}

export function useLoginMutation(): UseMutationResult<AuthUser, Error, LoginRequest> {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: login,
		onSuccess: (user) => {
			queryClient.setQueryData(AUTH_QUERY_KEYS.me, user);
		},
	});
}

export function useRegisterMutation(): UseMutationResult<AuthUser, Error, RegisterRequest> {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: register,
		onSuccess: (user) => {
			queryClient.setQueryData(AUTH_QUERY_KEYS.me, user);
		},
	});
}

export function useLogoutMutation(): UseMutationResult<void, Error, void> {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: logout,
		onSettled: () => {
			queryClient.setQueryData(AUTH_QUERY_KEYS.me, null);
		},
	});
}

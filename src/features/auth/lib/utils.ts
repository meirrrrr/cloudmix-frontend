import type { Dispatch, SetStateAction } from "react";

type ValidationErrorValue = string | string[] | undefined;
type ValidationErrorPayload = Record<string, ValidationErrorValue>;

export function createFieldUpdater<T>(setState: Dispatch<SetStateAction<T>>) {
	return function <K extends keyof T>(key: K, value: T[K]) {
		setState((current) => ({ ...current, [key]: value }));
	};
}

export function extractErrorMessage(errorData: unknown): string | null {
	if (!errorData || typeof errorData !== "object" || Array.isArray(errorData)) {
		return null;
	}

	const payload = errorData as ValidationErrorPayload;
	const messages: string[] = [];

	for (const value of Object.values(payload)) {
		if (typeof value === "string" && value.trim().length > 0) {
			messages.push(value.trim());
			continue;
		}

		if (Array.isArray(value)) {
			for (const message of value) {
				if (typeof message === "string" && message.trim().length > 0) {
					messages.push(message.trim());
				}
			}
		}
	}

	if (messages.length === 0) {
		return null;
	}

	return messages.join(" ");
}

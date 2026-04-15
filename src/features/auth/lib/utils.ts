import type { Dispatch, SetStateAction } from "react";

export function createFieldUpdater<T>(setState: Dispatch<SetStateAction<T>>) {
	return function <K extends keyof T>(key: K, value: T[K]) {
		setState((current) => ({ ...current, [key]: value }));
	};
}

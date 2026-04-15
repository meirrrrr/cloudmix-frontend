import { expect, test } from "@playwright/test";

test.describe("chat send/receive flow", () => {
	test("loads incoming messages and sends an outgoing message payload", async ({ page }) => {
		let postedBody: string | null = null;
		const unmatchedApiRequests: string[] = [];

		await page.addInitScript(() => {
			class MockWebSocket {
				static CONNECTING = 0;
				static OPEN = 1;
				static CLOSING = 2;
				static CLOSED = 3;

				readonly url: string;
				readyState = MockWebSocket.OPEN;
				onopen: ((event: Event) => void) | null = null;
				onmessage: ((event: MessageEvent) => void) | null = null;
				onerror: ((event: Event) => void) | null = null;
				onclose: ((event: CloseEvent) => void) | null = null;

				constructor(url: string) {
					this.url = url;
					setTimeout(() => {
						this.onopen?.(new Event("open"));
					}, 0);
				}

				close(): void {
					this.readyState = MockWebSocket.CLOSED;
					this.onclose?.(
						new CloseEvent("close", {
							code: 1000,
							wasClean: true,
							reason: "mocked",
						}),
					);
				}

				addEventListener(): void {}
				removeEventListener(): void {}
				dispatchEvent(): boolean {
					return true;
				}
			}

			Object.defineProperty(window, "WebSocket", {
				value: MockWebSocket,
				configurable: true,
				writable: true,
			});
		});

		await page.route("**/*", async (route) => {
			const request = route.request();
			const method = request.method();
			const url = new URL(request.url());
			const pathname = url.pathname;
			if (!pathname.startsWith("/api/")) {
				return route.continue();
			}

			if (method === "GET" && /^\/api\/accounts\/users\/me\/?$/.test(pathname)) {
				return route.fulfill({
					status: 200,
					contentType: "application/json",
					body: JSON.stringify({
						id: 1,
						username: "me",
						display_name: "Me",
						is_online: true,
						last_seen_at: null,
					}),
				});
			}

			if (method === "POST" && /^\/api\/accounts\/auth\/token\/refresh\/?$/.test(pathname)) {
				return route.fulfill({
					status: 200,
					contentType: "application/json",
					body: JSON.stringify({ detail: "refreshed" }),
				});
			}

			if (method === "GET" && /^\/api\/chat\/conversations\/?$/.test(pathname)) {
				return route.fulfill({
					status: 200,
					contentType: "application/json",
					body: JSON.stringify([
						{
							id: 1,
							updated_at: "2026-04-15T12:00:00Z",
							unread_count: 0,
							is_ai_assistant: false,
							last_message: {
								id: 101,
								body: "Hi there from Alex",
								created_at: "2026-04-15T12:00:00Z",
								sender: {
									id: 2,
									username: "alex",
									display_name: "Alex",
									is_online: true,
									last_seen_at: null,
								},
							},
							peer: {
								id: 2,
								username: "alex",
								display_name: "Alex",
								is_online: true,
								last_seen_at: null,
							},
						},
					]),
				});
			}

			if (method === "GET" && /^\/api\/chat\/conversations\/1\/?$/.test(pathname)) {
				return route.fulfill({
					status: 200,
					contentType: "application/json",
					body: JSON.stringify({
						id: 1,
						updated_at: "2026-04-15T12:00:00Z",
						unread_count: 0,
						is_ai_assistant: false,
						last_message: {
							id: 101,
							body: "Hi there from Alex",
							created_at: "2026-04-15T12:00:00Z",
							sender: {
								id: 2,
								username: "alex",
								display_name: "Alex",
								is_online: true,
								last_seen_at: null,
							},
						},
						peer: {
							id: 2,
							username: "alex",
							display_name: "Alex",
							is_online: true,
							last_seen_at: null,
						},
					}),
				});
			}

			if (method === "GET" && /^\/api\/chat\/conversations\/1\/messages\/?$/.test(pathname)) {
				return route.fulfill({
					status: 200,
					contentType: "application/json",
					body: JSON.stringify({
						results: [
							{
								id: 101,
								body: "Hi there from Alex",
								created_at: "2026-04-15T12:00:00Z",
								sender: {
									id: 2,
									username: "alex",
									display_name: "Alex",
									is_online: true,
									last_seen_at: null,
								},
							},
						],
						has_more: false,
						next_before: null,
						next_before_created_at: null,
					}),
				});
			}

			if (method === "POST" && /^\/api\/chat\/conversations\/1\/messages\/?$/.test(pathname)) {
				const payload = request.postDataJSON() as { body?: string } | null;
				postedBody = payload?.body ?? null;

				return route.fulfill({
					status: 201,
					contentType: "application/json",
					body: JSON.stringify({
						id: 202,
						body: postedBody,
						created_at: "2026-04-15T12:01:00Z",
						sender: {
							id: 1,
							username: "me",
							display_name: "Me",
							is_online: true,
							last_seen_at: null,
						},
					}),
				});
			}

			unmatchedApiRequests.push(`${method} ${pathname}`);
			return route.fulfill({
				status: 500,
				contentType: "application/json",
				body: JSON.stringify({
					detail: `Missing mock for ${method} ${pathname}`,
				}),
			});
		});

		await page.goto("/chat/1");
		await page.waitForTimeout(500);
		expect(unmatchedApiRequests).toEqual([]);

		await expect(page.locator("section").getByText("Hi there from Alex")).toBeVisible();

		const composerInput = page.getByPlaceholder("Write a message ...");
		await composerInput.fill("Hello Alex from e2e");
		await page.getByRole("button", { name: "Send message" }).click();

		await expect.poll(() => postedBody).toBe("Hello Alex from e2e");
		await expect(composerInput).toHaveValue("");
	});
});

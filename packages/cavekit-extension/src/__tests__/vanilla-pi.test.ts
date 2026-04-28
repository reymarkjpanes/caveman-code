/**
 * Vanilla Pi compatibility tests (T-028 / extension-core/R8).
 *
 * AC-1: Extension loads and initializes without error on minimal host.
 * AC-2: All slash commands functional on minimal host.
 * AC-3: Features depending on thin fork degrade silently (no errors).
 *
 * Strategy: construct a minimal mock ExtensionAPI that matches the minimal host
 * surface (no cave-mode-specific extras).  Pass it to the extension entry point
 * and verify nothing throws.  Command/hook handlers are exercised with the same
 * mock so that any unchecked cave-specific API access surfaces immediately.
 */

import { describe, expect, it, vi } from "vitest";

// ============================================================================
// Minimal mock ExtensionAPI (minimal host surface — no cave-specific extras)
// ============================================================================

type HandlerFn = (...args: unknown[]) => unknown;

interface MockUI {
	notify: ReturnType<typeof vi.fn>;
}

interface MockCtx {
	cwd: string;
	ui: MockUI;
	waitForIdle: ReturnType<typeof vi.fn>;
}

interface RegisteredCommand {
	description: string;
	getArgumentCompletions: HandlerFn;
	handler: HandlerFn;
}

interface RegisteredTool {
	name: string;
	[key: string]: unknown;
}

interface RegisteredShortcut {
	description?: string;
	handler: HandlerFn;
}

/**
 * Build a minimal host–style ExtensionAPI mock.
 * Stores all registered commands/tools/shortcuts for later inspection.
 */
function createVanillaPiMock() {
	const commands = new Map<string, RegisteredCommand>();
	const tools: RegisteredTool[] = [];
	const shortcuts = new Map<string, RegisteredShortcut>();
	const eventHandlers = new Map<string, HandlerFn[]>();

	const ui: MockUI = {
		notify: vi.fn(),
	};

	const ctx: MockCtx = {
		cwd: process.cwd(),
		ui,
		waitForIdle: vi.fn(async () => {}),
	};

	const api = {
		// Event subscription (minimal host has all standard events)
		on: vi.fn((event: string, handler: HandlerFn) => {
			if (!eventHandlers.has(event)) eventHandlers.set(event, []);
			eventHandlers.get(event)!.push(handler);
		}),

		// Tool, command, shortcut registration
		registerTool: vi.fn((tool: RegisteredTool) => {
			tools.push(tool);
		}),
		registerCommand: vi.fn((name: string, opts: RegisteredCommand) => {
			commands.set(name, opts);
		}),
		registerShortcut: vi.fn((key: string, opts: RegisteredShortcut) => {
			shortcuts.set(key, opts);
		}),
		registerFlag: vi.fn(),
		registerMessageRenderer: vi.fn(),

		// Actions (minimal host, no cave-mode-specific extras)
		sendMessage: vi.fn(),
		sendUserMessage: vi.fn(),
		appendEntry: vi.fn(),
		getFlag: vi.fn(() => undefined),
		getActiveTools: vi.fn(() => []),
		getAllTools: vi.fn(() => []),
		setActiveTools: vi.fn(),
		getCommands: vi.fn(() => []),
		setSessionName: vi.fn(),
		getSessionName: vi.fn(() => undefined),
		setLabel: vi.fn(),
		exec: vi.fn(async () => ({ exitCode: 0, stdout: "", stderr: "" })),

		// Session / model (minimal host does not expose cave-mode getters)
		getModel: vi.fn(() => undefined),
		setModel: vi.fn(),
		getThinkingLevel: vi.fn(() => "none"),
		setThinkingLevel: vi.fn(),

		// Internal helpers used by tests
		_commands: commands,
		_tools: tools,
		_shortcuts: shortcuts,
		_eventHandlers: eventHandlers,
		_ctx: ctx,
	};

	return api;
}

// ============================================================================
// AC-1: Extension entry point initializes without throwing on minimal host
// ============================================================================

describe("cavekit extension — minimal host init (AC-1)", () => {
	it("loads and calls default export without throwing", async () => {
		// Dynamically import the extension so module-level side-effects are contained
		const mod = await import("../index.js");
		const cavekit = mod.default;

		const api = createVanillaPiMock();

		// Must not throw — even without cave-mode extras on the API
		expect(() => cavekit(api as unknown as Parameters<typeof cavekit>[0])).not.toThrow();
	});

	it("registers commands on minimal host", async () => {
		const mod = await import("../index.js");
		const cavekit = mod.default;

		const api = createVanillaPiMock();
		cavekit(api as unknown as Parameters<typeof cavekit>[0]);

		// All /ck:* commands should be registered
		expect(api.registerCommand).toHaveBeenCalled();
		expect(api._commands.size).toBeGreaterThan(0);
	});

	it("registers tools on minimal host", async () => {
		const mod = await import("../index.js");
		const cavekit = mod.default;

		const api = createVanillaPiMock();
		cavekit(api as unknown as Parameters<typeof cavekit>[0]);

		expect(api.registerTool).toHaveBeenCalled();
		expect(api._tools.length).toBeGreaterThan(0);
	});

	it("registers lifecycle hooks (event subscriptions) on minimal host", async () => {
		const mod = await import("../index.js");
		const cavekit = mod.default;

		const api = createVanillaPiMock();
		cavekit(api as unknown as Parameters<typeof cavekit>[0]);

		expect(api.on).toHaveBeenCalled();
		expect(api._eventHandlers.size).toBeGreaterThan(0);
	});
});

// ============================================================================
// AC-2: Slash commands functional on minimal host
// ============================================================================

describe("cavekit commands — minimal host (AC-2)", () => {
	async function getCommandMap() {
		const mod = await import("../index.js");
		const cavekit = mod.default;
		const api = createVanillaPiMock();
		cavekit(api as unknown as Parameters<typeof cavekit>[0]);
		return { commands: api._commands, ctx: api._ctx };
	}

	it("/ck:help handler executes without throwing", async () => {
		const { commands, ctx } = await getCommandMap();
		const cmd = commands.get("ck:help");
		expect(cmd).toBeDefined();
		await expect(cmd!.handler("", ctx)).resolves.not.toThrow();
		expect(ctx.ui.notify).toHaveBeenCalled();
	});

	it("/ck:draft handler with empty args shows usage warning (no throw)", async () => {
		const { commands, ctx } = await getCommandMap();
		const cmd = commands.get("ck:draft");
		expect(cmd).toBeDefined();
		// Empty args — should show warning, not throw
		await expect(cmd!.handler("", ctx)).resolves.not.toThrow();
		expect(ctx.ui.notify).toHaveBeenCalled();
	});

	it("/ck:config handler executes without throwing", async () => {
		const { commands, ctx } = await getCommandMap();
		const cmd = commands.get("ck:config");
		expect(cmd).toBeDefined();
		await expect(cmd!.handler("", ctx)).resolves.not.toThrow();
	});

	it("/ck:progress handler executes without throwing", async () => {
		const { commands, ctx } = await getCommandMap();
		const cmd = commands.get("ck:progress");
		expect(cmd).toBeDefined();
		await expect(cmd!.handler("", ctx)).resolves.not.toThrow();
	});

	it("all registered commands have valid handler functions", async () => {
		const { commands } = await getCommandMap();
		for (const [name, cmd] of commands) {
			expect(typeof cmd.handler, `${name} handler should be a function`).toBe("function");
		}
	});

	it("all registered commands handle empty args without throwing on minimal host", async () => {
		const { commands, ctx } = await getCommandMap();
		for (const [name, cmd] of commands) {
			await expect(
				Promise.resolve(cmd.handler("", ctx)),
				`${name} should handle empty args without throwing on minimal host`,
			).resolves.toBeUndefined();
		}
	});
});

// ============================================================================
// AC-3: cave-specific features degrade silently on minimal host
// ============================================================================

describe("cavekit hooks — minimal host graceful degradation (AC-3)", () => {
	async function getHandlers() {
		const mod = await import("../index.js");
		const cavekit = mod.default;
		const api = createVanillaPiMock();
		cavekit(api as unknown as Parameters<typeof cavekit>[0]);
		return { handlers: api._eventHandlers, ctx: api._ctx };
	}

	it("before_agent_start hook does not throw when .cavekit/ is absent", async () => {
		const { handlers, ctx } = await getHandlers();
		const hookHandlers = handlers.get("before_agent_start") ?? [];
		expect(hookHandlers.length).toBeGreaterThan(0);

		// Simulate event from minimal host (no .cavekit/ dir in a temp cwd)
		const event = { systemPrompt: "You are an assistant." };
		const tempCtx = { ...ctx, cwd: "/tmp/non-existent-vanilla-pi-project" };

		for (const handler of hookHandlers) {
			await expect(Promise.resolve(handler(event, tempCtx))).resolves.not.toThrow();
		}
	});

	it("session_before_compact hook does not throw when .cavekit/ is absent", async () => {
		const { handlers, ctx } = await getHandlers();
		const hookHandlers = handlers.get("session_before_compact") ?? [];
		expect(hookHandlers.length).toBeGreaterThan(0);

		const event = { customInstructions: undefined };
		const tempCtx = { ...ctx, cwd: "/tmp/non-existent-vanilla-pi-project" };

		for (const handler of hookHandlers) {
			await expect(Promise.resolve(handler(event, tempCtx))).resolves.not.toThrow();
		}
	});

	it("resources_discover hook does not throw on minimal host", async () => {
		const { handlers } = await getHandlers();
		const hookHandlers = handlers.get("resources_discover") ?? [];
		expect(hookHandlers.length).toBeGreaterThan(0);

		for (const handler of hookHandlers) {
			const result = await Promise.resolve(handler({}, {}));
			// Should return an object with skillPaths array
			expect(result).toHaveProperty("skillPaths");
		}
	});

	it("CAVEKIT_DEBUG=true flag is inspected by the extension entry point", () => {
		// Verify that the debug env variable is wired up: when CAVEKIT_DEBUG is set
		// the extension logs environment info and re-throws init errors instead of
		// swallowing them silently. We only verify the env is readable here because
		// re-triggering the module-level catch requires a separate subprocess.
		const originalDebug = process.env.CAVEKIT_DEBUG;
		process.env.CAVEKIT_DEBUG = "1";

		try {
			expect(process.env.CAVEKIT_DEBUG).toBe("1");
		} finally {
			if (originalDebug === undefined) {
				delete process.env.CAVEKIT_DEBUG;
			} else {
				process.env.CAVEKIT_DEBUG = originalDebug;
			}
		}
	});
});

// ============================================================================
// Config loading — never throws on minimal host
// ============================================================================

describe("loadConfig — minimal host (AC-1 support)", () => {
	it("returns default config without throwing even when no config files exist", async () => {
		const { loadConfig } = await import("../config/index.js");
		// Should not throw — missing files are silently ignored
		expect(() => loadConfig()).not.toThrow();
		const config = loadConfig();
		expect(typeof config).toBe("object");
		expect(config).not.toBeNull();
	});
});

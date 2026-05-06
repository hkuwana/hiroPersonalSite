// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
// and what to do when importing types
declare namespace App {
	// interface Locals {}
	// interface Platform {}
	// interface PrivateEnv {}
	// interface PublicEnv {}
	// interface Session {}
}

declare module 'async_hooks' {
	class AsyncLocalStorage<T> {
		disable(): void;
		getStore(): T | undefined;
		run<R>(store: T, callback: (...args: unknown[]) => R, ...args: unknown[]): R;
	}
}

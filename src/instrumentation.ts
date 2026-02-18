export function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    // WalletConnect and MetaMask SDK access localStorage during SSR.
    // Provide a no-op in-memory shim so they don't crash the server render.
    const store: Record<string, string> = {};
    const shim = {
      getItem: (key: string) => store[key] ?? null,
      setItem: (key: string, value: string) => { store[key] = String(value); },
      removeItem: (key: string) => { delete store[key]; },
      clear: () => { Object.keys(store).forEach((k) => delete store[k]); },
      key: (_index: number) => null,
      get length() { return Object.keys(store).length; },
    };
    Object.defineProperty(globalThis, "localStorage", { value: shim, writable: true });
    Object.defineProperty(globalThis, "sessionStorage", { value: shim, writable: true });
  }
}

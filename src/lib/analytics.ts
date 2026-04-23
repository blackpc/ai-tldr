declare global {
  interface Window {
    umami?: {
      track: (name: string, data?: Record<string, unknown>) => void;
    };
  }
}

export function track(name: string, data?: Record<string, unknown>): void {
  if (typeof window === "undefined") return;
  window.umami?.track(name, data);
}

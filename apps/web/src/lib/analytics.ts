/**
 * Analytics utility for tracking user events
 * 
 * Supports Plausible and PostHog analytics providers.
 * Configure via environment variables:
 * - NEXT_PUBLIC_ANALYTICS_PROVIDER: "plausible" | "posthog" | undefined
 * - NEXT_PUBLIC_ANALYTICS_SITE_ID: Plausible site ID (for Plausible)
 * - NEXT_PUBLIC_POSTHOG_KEY: PostHog project API key (for PostHog)
 * - NEXT_PUBLIC_POSTHOG_HOST: PostHog host URL (for PostHog)
 * 
 * If provider is unset, analytics is a no-op (safe for development).
 */

type EventProperties = Record<string, any>;

// Get analytics provider from env
const getProvider = (): "plausible" | "posthog" | null => {
  if (typeof window === "undefined") return null;
  const provider = process.env.NEXT_PUBLIC_ANALYTICS_PROVIDER?.toLowerCase();
  if (provider === "plausible" || provider === "posthog") {
    return provider;
  }
  return null;
};

// Initialize Plausible script
const initPlausible = () => {
  if (typeof window === "undefined" || (window as any).plausible) {
    return;
  }

  const siteId = process.env.NEXT_PUBLIC_ANALYTICS_SITE_ID;
  if (!siteId) {
    console.warn("[Analytics] Plausible site ID not configured");
    return;
  }

  // Create Plausible script
  const script = document.createElement("script");
  script.defer = true;
  script.dataset.domain = siteId;
  script.src = "https://plausible.io/js/script.js";
  document.head.appendChild(script);

  // Initialize plausible function
  (window as any).plausible = (window as any).plausible || function () {
    ((window as any).plausible.q = (window as any).plausible.q || []).push(arguments);
  };
};

// Initialize PostHog
const initPostHog = async () => {
  if (typeof window === "undefined" || (window as any).posthog) {
    return;
  }

  const posthogKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  const posthogHost = process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://app.posthog.com";

  if (!posthogKey) {
    console.warn("[Analytics] PostHog key not configured");
    return;
  }

  try {
    // Dynamic import to avoid SSR issues and make PostHog optional
    // If posthog-js is not installed, this will fail gracefully
    let posthogModule;
    try {
      posthogModule = await import("posthog-js");
    } catch (importError) {
      console.warn("[Analytics] posthog-js package not installed. Install with: pnpm add posthog-js");
      return;
    }

    if (!posthogModule || !posthogModule.default) {
      console.warn("[Analytics] PostHog module not available");
      return;
    }

    const { default: posthog } = posthogModule;
    posthog.init(posthogKey, {
      api_host: posthogHost,
      loaded: (posthog) => {
        if (process.env.NODE_ENV === "development") {
          posthog.debug();
        }
      },
    });
    (window as any).posthog = posthog;
  } catch (error) {
    console.error("[Analytics] Failed to load PostHog", error);
  }
};

// Initialize analytics on first use
let initialized = false;
const ensureInitialized = () => {
  if (initialized || typeof window === "undefined") return;
  
  const provider = getProvider();
  if (provider === "plausible") {
    initPlausible();
  } else if (provider === "posthog") {
    initPostHog();
  }
  
  initialized = true;
};

/**
 * Track a user event
 * 
 * @param name - Event name (e.g., "landing_cta_creator", "creator_onboarding_start")
 * @param props - Optional event properties
 */
export function trackEvent(name: string, props?: EventProperties): void {
  // Only run on client side
  if (typeof window === "undefined") {
    return;
  }

  ensureInitialized();
  const provider = getProvider();

  // Log to console in development
  if (process.env.NODE_ENV === "development") {
    console.log("[Analytics]", name, props || {});
  }

  // Send to analytics provider
  if (provider === "plausible") {
    const plausible = (window as any).plausible;
    if (plausible) {
      // Plausible custom events
      plausible(name, { props: props || {} });
    }
  } else if (provider === "posthog") {
    const posthog = (window as any).posthog;
    if (posthog) {
      posthog.capture(name, props || {});
    }
  }

  // Dispatch custom event for any listeners
  window.dispatchEvent(
    new CustomEvent("analytics:track", {
      detail: { name, props },
    })
  );
}

/**
 * Track page view
 * 
 * @param path - Page path (e.g., "/for-creators")
 * @param title - Page title (optional)
 */
export function trackPageView(path: string, title?: string): void {
  if (typeof window === "undefined") {
    return;
  }

  ensureInitialized();
  const provider = getProvider();

  if (process.env.NODE_ENV === "development") {
    console.log("[Analytics] Page View", { path, title });
  }

  // Send to analytics provider
  if (provider === "plausible") {
    const plausible = (window as any).plausible;
    if (plausible) {
      // Plausible automatically tracks pageviews, but we can trigger manually if needed
      plausible("pageview", { url: path });
    }
  } else if (provider === "posthog") {
    const posthog = (window as any).posthog;
    if (posthog) {
      posthog.capture("$pageview", {
        $current_url: path,
        page_title: title,
      });
    }
  }
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    plausible?: {
      q: any[];
      (event: string, options?: { props?: Record<string, any> }): void;
    };
    posthog?: any;
  }
}

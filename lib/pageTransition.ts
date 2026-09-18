// Coordinates a solid-color crossfade overlay across route boundaries
// (Work <-> About Us, and Home <-> Selected Work).
//
// Each route is its own React tree in the App Router, so there's no shared
// component that can own a single "in-flight" transition state. Instead, the
// outgoing page writes a one-shot flag to sessionStorage right before it
// starts its exit animation and calls router.push. The incoming page reads
// (and clears) that flag on mount to decide whether to render its own
// entrance overlay in the *same* color the previous page's exit animation
// ended on — so the two independent fade animations line up into what reads
// as a single continuous crossfade instead of a hard cut + separate fade-in.

export type NavTransition =
  | "work-to-about"
  | "about-to-work"
  | "home-to-work"
  | "work-to-home";

const KEY = "shader:nav-transition";

export function setNavTransition(direction: NavTransition) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(KEY, direction);
  } catch {
    // sessionStorage unavailable (private browsing, etc.) — the incoming
    // page just falls back to its default (non-crossfade) entrance.
  }
}

/**
 * Reads and clears the pending transition flag. This is one-shot by design:
 * call it once on mount so a manual refresh or direct link never replays a
 * stale crossfade.
 */
export function consumeNavTransition(): NavTransition | null {
  if (typeof window === "undefined") return null;
  try {
    const value = sessionStorage.getItem(KEY);
    if (value) sessionStorage.removeItem(KEY);
    return (value as NavTransition) || null;
  } catch {
    return null;
  }
}

"use client";

import { useEffect } from 'react';

/**
 * AuthHashGuard
 * Strips auth token fragments (#access_token, #refresh_token, #provider_token) from the URL
 * if they appear due to provider implicit flow or misconfiguration. Runs globally once on mount.
 */
export default function AuthHashGuard() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const { hash, pathname, search } = window.location;
    if (hash && /#(access_token|refresh_token|provider_token)/i.test(hash)) {
      // Replace state with URL minus the hash to avoid leaking tokens
      window.history.replaceState(null, '', pathname + search);
    }
  }, []);
  return null;
}

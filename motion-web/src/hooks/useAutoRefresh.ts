import { useEffect, useRef } from 'react';

interface UseAutoRefreshOptions {
  enabled?: boolean;
  timeout?: number; // milliseconds
  onTimeout?: () => void;
}

/**
 * Hook to automatically refresh the page if loading takes too long
 * Useful for fixing those "stuck loading" issues
 */
export function useAutoRefresh({
  enabled = true,
  timeout = 30000, // 30 seconds default
  onTimeout
}: UseAutoRefreshOptions = {}) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!enabled) return;

    // Set up timeout
    timeoutRef.current = setTimeout(() => {
      console.warn('🔄 Page loading timeout reached, refreshing...');
      
      if (onTimeout) {
        onTimeout();
      } else {
        // Default behavior: reload the page
        window.location.reload();
      }
    }, timeout);

    // Cleanup on unmount or when loading completes
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [enabled, timeout, onTimeout]);

  // Function to cancel the auto-refresh (call when loading completes)
  const cancelAutoRefresh = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  return { cancelAutoRefresh };
}

/**
 * Component wrapper that automatically handles loading timeouts
 */
interface AutoRefreshWrapperProps {
  loading: boolean;
  timeout?: number;
  children: React.ReactNode;
  onTimeout?: () => void;
}

export function AutoRefreshWrapper({ 
  loading, 
  timeout = 30000, 
  children, 
  onTimeout 
}: AutoRefreshWrapperProps) {
  const { cancelAutoRefresh } = useAutoRefresh({
    enabled: loading,
    timeout,
    onTimeout
  });

  // Cancel auto-refresh when loading stops
  useEffect(() => {
    if (!loading) {
      cancelAutoRefresh();
    }
  }, [loading, cancelAutoRefresh]);

  return children;
}

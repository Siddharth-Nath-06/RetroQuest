// Custom React hook for debouncing callbacks (anti-cheat for Complete/Buy buttons)

import { useRef, useCallback } from 'react';

export const useDebounce = (callback, delay = 500) => {
    const isDebouncing = useRef(false);
    const timeoutRef = useRef(null);

    const debouncedCallback = useCallback((...args) => {
        // If already debouncing, reject the call
        if (isDebouncing.current) {
            console.log('Action blocked by debounce (anti-cheat)');
            return false;
        }

        // Set debouncing flag
        isDebouncing.current = true;

        // Execute the callback
        callback(...args);

        // Clear debouncing flag after delay
        timeoutRef.current = setTimeout(() => {
            isDebouncing.current = false;
        }, delay);

        return true;
    }, [callback, delay]);

    return {
        debouncedCallback,
        isDebouncing: () => isDebouncing.current
    };
};

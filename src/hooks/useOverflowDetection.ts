// ponytail: ResizeObserver detects overflow — measures actions area dynamically
import { useState, useEffect, useCallback, useRef, RefObject } from "react";

export function useOverflowDetection(
    containerRef: RefObject<HTMLElement | null>,
    childrenRef: RefObject<HTMLElement | null>,
    actionsRef?: RefObject<HTMLElement | null>
): boolean {
    const [isOverflowing, setIsOverflowing] = useState(false);
    const lastWidthRef = useRef(0);

    const checkOverflow = useCallback(() => {
        const container = containerRef.current;
        const children = childrenRef.current;
        if (!container) return;

        // If children are hidden (display:none), scrollWidth is 0 — use last known width
        const childrenWidth = children ? (children.scrollWidth || lastWidthRef.current) : 0;
        if (children && children.scrollWidth > 0) {
            lastWidthRef.current = children.scrollWidth;
        }

        // Measure actions area width dynamically, fallback to 220px
        const actionsWidth = actionsRef?.current?.offsetWidth || 220;
        const availableWidth = container.clientWidth - actionsWidth;
        setIsOverflowing(childrenWidth > availableWidth);
    }, [containerRef, childrenRef, actionsRef]);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        checkOverflow();

        const observer = new ResizeObserver(checkOverflow);
        observer.observe(container);

        return () => observer.disconnect();
    }, [checkOverflow, containerRef]);

    return isOverflowing;
}

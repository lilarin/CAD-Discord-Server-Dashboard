import {useState, useRef, useCallback, useEffect} from 'react';

export const useHintAnimation = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [opacity, setOpacity] = useState(isVisible ? 1 : 0);
    const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

    useEffect(() => {
        setOpacity(isVisible ? 1 : 0);
    }, [isVisible]);


    const open = useCallback(() => {
        clearTimeout(timeoutRef.current);
        if (!isVisible) {
            timeoutRef.current = setTimeout(() => {
                setIsVisible(true);
                requestAnimationFrame(() => setOpacity(1));
            }, 150);
        }
    }, [isVisible]);

    const close = useCallback(() => {
        clearTimeout(timeoutRef.current);
        if (isVisible) {
            requestAnimationFrame(() => setOpacity(0));
            timeoutRef.current = setTimeout(() => setIsVisible(false), 300);
        }
    }, [isVisible]);

    const toggle = useCallback(() => {
        if (isVisible) {
            close();
        } else {
            open();
        }
    }, [isVisible, close, open]);

    return {
        isVisible,
        opacity,
        open,
        close,
        toggle,
    };
};
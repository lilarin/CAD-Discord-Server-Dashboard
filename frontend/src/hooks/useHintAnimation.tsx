import {useState, useRef, useCallback, useEffect} from 'react';

export const useHintAnimation = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [opacity, setOpacity] = useState(0);
    const timeoutRef = useRef<ReturnType<typeof setTimeout>>();

    useEffect(() => {
        if (isVisible) {
            requestAnimationFrame(() => setOpacity(1));
        } else {
            setOpacity(0);
        }
    }, [isVisible]);


    const open = useCallback(() => {
        clearTimeout(timeoutRef.current);
        if (!isVisible) {
            setIsVisible(true);
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
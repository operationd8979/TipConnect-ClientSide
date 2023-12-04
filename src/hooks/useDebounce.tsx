import { useState, useEffect } from 'react';

interface propsDebounce {
    value: string;
    delay: number;
}

function useDebounce({ value, delay }: propsDebounce) {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        if (value === '') setDebouncedValue(value);
        else {
            const handler = setTimeout(() => setDebouncedValue(value), delay);
            return () => clearTimeout(handler);
        }
    }, [value]);

    return debouncedValue;
}

export default useDebounce;

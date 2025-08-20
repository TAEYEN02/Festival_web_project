import { useEffect, useState } from "react";

const KEY = "scraps_v1";

export default function useScrap() {
    const [scraps, setScraps] = useState(() => {
        try {
            const raw = localStorage.getItem(KEY);
            return raw ? JSON.parse(raw) : [];
        } catch {
            return [];
        }
    });

    useEffect(() => {
        try {
            localStorage.setItem(KEY, JSON.stringify(scraps));
        } catch {
            // ignore
        }
    }, [scraps]);

    const isScrapped = (id) => scraps.includes(id);

    const toggleScrap = (id) => {
        setScraps((prev) => {
            if (prev.includes(id)) return prev.filter(x => x !== id);
            return [...prev, id];
        });
    };

    return { scraps, isScrapped, toggleScrap };
}
